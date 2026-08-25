# ==============================================================================
# VIIRS Nighttime Lights -> SQM
#
# LOW-RAM VERSION FOR LARGE EPSG:4326 RASTERS
#
# Designed for an ~8 GB RAM computer.
#
# Input example:
#   86401 x 33601
#   EPSG:4326
#   0.0041666667 degrees/pixel
#
# The raster is processed in latitude bands. Longitude distances are adjusted
# for latitude, so the 100 km scattering radius remains approximately physical.
#
# Requirements:
#     pip install numpy scipy rasterio
# ==============================================================================

import gc
import math

import numpy as np
import rasterio
from rasterio.windows import Window
from scipy.signal import oaconvolve


# ==============================================================================
# CONFIGURATION
# ==============================================================================

INPUT_RASTER = "viirs_projected.tif"
OUTPUT_RASTER = "viirs_sqm_output.tif"

# Atmospheric model
K_COEFF = 0.00005
N_EXP = 1.0

# Maximum physical scattering distance
MAX_RADIUS_M = 100_000.0

# Sky brightness
R_NATURAL = np.float32(0.174)
VIIRS_TO_RADIANCE_SCALE = np.float32(0.01)

# Natural sky brightness
NATURAL_SQM = np.float32(21.74)

# --------------------------------------------------------------------------
# MEMORY SETTINGS
# --------------------------------------------------------------------------

# Number of latitude rows processed at once.
#
# 256 = very low RAM
# 512 = recommended for ~8 GB
# 1024 = faster, more RAM
#
BAND_ROWS = 512

# Number of longitude columns processed at once.
#
# None = entire longitude range.
#
# For your 86401-column raster, DO NOT use the entire width at once.
# 4096 is a good starting point.
TILE_COLS = 4096

# Width of each convolution tile.
#
# This is separate from BAND_ROWS because the scattering radius can be
# hundreds of pixels.
#
TILE_ROWS = 256

# Set this to True for more diagnostic output.
VERBOSE = True


# ==============================================================================
# CONSTANTS
# ==============================================================================

# Mean Earth radius.
EARTH_RADIUS_M = 6_371_008.8

# Degree -> radians
DEG_TO_RAD = np.pi / 180.0


# ==============================================================================
# UTILITY
# ==============================================================================

def cleanup():
    """
    Encourage Python/NumPy to release temporary arrays.
    """
    gc.collect()


def meters_per_degree_latitude(latitude_deg):
    """
    Approximate meters per degree latitude.

    More accurate than assuming every degree has the same physical size.
    """

    lat = latitude_deg * DEG_TO_RAD

    return (
        111132.92
        - 559.82 * np.cos(2 * lat)
        + 1.175 * np.cos(4 * lat)
        - 0.0023 * np.cos(6 * lat)
    )


def meters_per_degree_longitude(latitude_deg):
    """
    Approximate meters per degree longitude.
    """

    lat = latitude_deg * DEG_TO_RAD

    return (
        111412.84 * np.cos(lat)
        - 93.5 * np.cos(3 * lat)
        + 0.118 * np.cos(5 * lat)
    )


# ==============================================================================
# KERNEL
# ==============================================================================

def create_kernel(
    pixel_size_x_m,
    pixel_size_y_m,
    max_radius_m
):
    """
    Create a physically-scaled scattering kernel.

    pixel_size_x_m varies with latitude.
    pixel_size_y_m is approximately constant for the geographic raster.
    """

    radius_x = int(
        math.ceil(max_radius_m / pixel_size_x_m)
    )

    radius_y = int(
        math.ceil(max_radius_m / pixel_size_y_m)
    )

    width = radius_x * 2 + 1
    height = radius_y * 2 + 1

    if VERBOSE:
        print(
            f"    Kernel: {width} x {height} "
            f"({width * height:,} pixels)"
        )

    # ----------------------------------------------------------------------
    # Create distance grid.
    #
    # Use float32 everywhere possible.
    # ----------------------------------------------------------------------

    y = (
        np.arange(
            -radius_y,
            radius_y + 1,
            dtype=np.float32
        )
        * np.float32(pixel_size_y_m)
    )

    x = (
        np.arange(
            -radius_x,
            radius_x + 1,
            dtype=np.float32
        )
        * np.float32(pixel_size_x_m)
    )

    # Broadcasting avoids creating full X/Y mesh grids.
    distance = np.sqrt(
        y[:, None] ** 2 +
        x[None, :] ** 2
    )

    # Avoid singularity at zero distance.
    distance[distance == 0] = np.float32(
        min(pixel_size_x_m, pixel_size_y_m) / 2
    )

    # ----------------------------------------------------------------------
    # Atmospheric scattering equation
    #
    # K(d) = exp(-k*d) / d^n
    # ----------------------------------------------------------------------

    kernel = (
        np.exp(
            -np.float32(K_COEFF) * distance
        )
        /
        np.power(
            distance,
            np.float32(N_EXP)
        )
    )

    del distance
    del x
    del y

    # ----------------------------------------------------------------------
    # Normalize.
    #
    # Use float64 only for the scalar sum.
    # ----------------------------------------------------------------------

    total = np.sum(
        kernel,
        dtype=np.float64
    )

    kernel /= np.float32(total)

    kernel = kernel.astype(
        np.float32,
        copy=False
    )

    cleanup()

    return kernel


# ==============================================================================
# SQM CONVERSION
# ==============================================================================

def convert_to_sqm(data):
    """
    Convert scattered VIIRS radiance to SQM.

    Operates in-place wherever possible.
    """

    data *= VIIRS_TO_RADIANCE_SCALE

    data += R_NATURAL

    data /= R_NATURAL

    np.log10(
        data,
        out=data
    )

    data *= np.float32(-2.5)

    data += NATURAL_SQM

    np.clip(
        data,
        np.float32(16.0),
        np.float32(21.74),
        out=data
    )

    return data


# ==============================================================================
# PROCESS TILE
# ==============================================================================

def process_tile(
    src,
    dst,
    kernel,
    row_start,
    row_end,
    col_start,
    col_end,
    radius_y,
    radius_x,
    nodata
):
    """
    Process one tile with a scattering-radius border.
    """

    # ----------------------------------------------------------------------
    # Determine expanded read window.
    # ----------------------------------------------------------------------

    read_row_start = max(
        0,
        row_start - radius_y
    )

    read_row_end = min(
        src.height,
        row_end + radius_y
    )

    read_col_start = max(
        0,
        col_start - radius_x
    )

    read_col_end = min(
        src.width,
        col_end + radius_x
    )

    read_width = (
        read_col_end -
        read_col_start
    )

    read_height = (
        read_row_end -
        read_row_start
    )

    window = Window(
        read_col_start,
        read_row_start,
        read_width,
        read_height
    )

    # ----------------------------------------------------------------------
    # Read only this portion of the raster.
    # ----------------------------------------------------------------------

    data = src.read(
        1,
        window=window,
        out_dtype=np.float32
    )

    # ----------------------------------------------------------------------
    # Clean VIIRS data.
    # ----------------------------------------------------------------------

    if nodata is not None:
        data[data == nodata] = 0

    np.maximum(
        data,
        np.float32(0),
        out=data
    )

    # ----------------------------------------------------------------------
    # Convolution.
    #
    # oaconvolve is used instead of fftconvolve because the input tile is
    # much larger than the kernel and overlap-add is specifically designed
    # for this type of operation.
    # ----------------------------------------------------------------------

    scattered = oaconvolve(
        data,
        kernel,
        mode="same"
    )

    # Make sure the result is float32.
    if scattered.dtype != np.float32:
        scattered = scattered.astype(
            np.float32,
            copy=False
        )

    del data

    # ----------------------------------------------------------------------
    # Crop away the scattering border.
    # ----------------------------------------------------------------------

    crop_top = row_start - read_row_start
    crop_left = col_start - read_col_start

    crop_bottom = (
        crop_top +
        (row_end - row_start)
    )

    crop_right = (
        crop_left +
        (col_end - col_start)
    )

    result = scattered[
        crop_top:crop_bottom,
        crop_left:crop_right
    ]

    # Make a compact copy so the huge convolution result can be released.
    result = result.copy()

    del scattered

    # ----------------------------------------------------------------------
    # Convert to SQM.
    # ----------------------------------------------------------------------

    convert_to_sqm(result)

    # ----------------------------------------------------------------------
    # Write.
    # ----------------------------------------------------------------------

    output_window = Window(
        col_start,
        row_start,
        col_end - col_start,
        row_end - row_start
    )

    dst.write(
        result,
        1,
        window=output_window
    )

    del result

    cleanup()


# ==============================================================================
# MAIN
# ==============================================================================

def main():

    print("=" * 75)
    print("VIIRS NIGHTTIME LIGHTS -> SQM")
    print("LOW-RAM LATITUDE-BAND PROCESSOR")
    print("=" * 75)

    # --------------------------------------------------------------------------
    # Open input
    # --------------------------------------------------------------------------

    with rasterio.open(INPUT_RASTER) as src:

        print()
        print("Input raster:")
        print(f"  CRS:       {src.crs}")
        print(f"  Width:     {src.width:,}")
        print(f"  Height:    {src.height:,}")
        print(f"  Resolution:{src.res}")
        print(f"  Bounds:    {src.bounds}")

        if src.crs is None:
            raise ValueError(
                "Raster has no CRS."
            )

        if src.crs.to_epsg() != 4326:
            raise ValueError(
                "This version expects an EPSG:4326 raster."
            )

        # ----------------------------------------------------------------------
        # Geographic resolution.
        # ----------------------------------------------------------------------

        pixel_deg_x = abs(src.transform.a)
        pixel_deg_y = abs(src.transform.e)

        # Physical Y pixel size is almost constant.
        center_lat = (
            src.bounds.top +
            src.bounds.bottom
        ) / 2.0

        pixel_size_y_m = (
            pixel_deg_y *
            meters_per_degree_latitude(center_lat)
        )

        print()
        print(
            f"Approximate north/south pixel size: "
            f"{pixel_size_y_m:.2f} m"
        )

        # ----------------------------------------------------------------------
        # Output metadata.
        # ----------------------------------------------------------------------

        meta = src.meta.copy()

        meta.update(
            dtype="float32",
            count=1,
            nodata=-9999,
            compress="deflate",
            predictor=3,
            BIGTIFF="YES",
            tiled=True,
            blockxsize=256,
            blockysize=256
        )

        # ----------------------------------------------------------------------
        # Create output.
        # ----------------------------------------------------------------------

        with rasterio.open(
            OUTPUT_RASTER,
            "w",
            **meta
        ) as dst:

            total_bands = (
                src.height +
                BAND_ROWS -
                1
            ) // BAND_ROWS

            band_number = 0

            # ==================================================================
            # PROCESS LATITUDE BANDS
            # ==================================================================

            for band_start in range(
                0,
                src.height,
                BAND_ROWS
            ):

                band_end = min(
                    band_start + BAND_ROWS,
                    src.height
                )

                band_number += 1

                # --------------------------------------------------------------
                # Latitude at center of this band.
                # --------------------------------------------------------------

                center_row = (
                    band_start +
                    band_end
                ) // 2

                latitude = (
                    src.transform.f +
                    (center_row + 0.5) *
                    src.transform.e
                )

                # --------------------------------------------------------------
                # Physical pixel sizes at this latitude.
                # --------------------------------------------------------------

                pixel_size_x_m = (
                    pixel_deg_x *
                    meters_per_degree_longitude(
                        latitude
                    )
                )

                pixel_size_y_m = (
                    pixel_deg_y *
                    meters_per_degree_latitude(
                        latitude
                    )
                )

                radius_x = int(
                    math.ceil(
                        MAX_RADIUS_M /
                        pixel_size_x_m
                    )
                )

                radius_y = int(
                    math.ceil(
                        MAX_RADIUS_M /
                        pixel_size_y_m
                    )
                )

                print()
                print(
                    f"Band {band_number}/{total_bands}"
                )
                print(
                    f"  Rows: {band_start:,} - {band_end:,}"
                )
                print(
                    f"  Latitude: {latitude:.2f}°"
                )
                print(
                    f"  Pixel size: "
                    f"{pixel_size_x_m:.1f}m x "
                    f"{pixel_size_y_m:.1f}m"
                )
                print(
                    f"  Radius: "
                    f"{radius_x} x {radius_y} pixels"
                )

                # --------------------------------------------------------------
                # Create kernel for this latitude.
                # --------------------------------------------------------------

                kernel = create_kernel(
                    pixel_size_x_m,
                    pixel_size_y_m,
                    MAX_RADIUS_M
                )

                # --------------------------------------------------------------
                # Process longitude tiles.
                # --------------------------------------------------------------

                total_tiles = (
                    src.width +
                    TILE_COLS -
                    1
                ) // TILE_COLS

                for tile_number, col_start in enumerate(
                    range(
                        0,
                        src.width,
                        TILE_COLS
                    ),
                    start=1
                ):

                    col_end = min(
                        col_start + TILE_COLS,
                        src.width
                    )

                    print(
                        f"  Tile {tile_number}/{total_tiles}: "
                        f"columns {col_start:,}-{col_end:,}"
                    )

                    process_tile(
                        src=src,
                        dst=dst,
                        kernel=kernel,
                        row_start=band_start,
                        row_end=band_end,
                        col_start=col_start,
                        col_end=col_end,
                        radius_y=radius_y,
                        radius_x=radius_x,
                        nodata=src.nodata
                    )

                # --------------------------------------------------------------
                # Release this latitude's kernel before making the next one.
                # --------------------------------------------------------------

                del kernel
                cleanup()

                print(
                    f"  Completed "
                    f"{100.0 * band_number / total_bands:.1f}%"
                )

    print()
    print("=" * 75)
    print("COMPLETE")
    print(f"Output: {OUTPUT_RASTER}")
    print("=" * 75)


if __name__ == "__main__":
    main()

