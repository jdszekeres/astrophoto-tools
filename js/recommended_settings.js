const MD = `

# Astrophotography Camera Setup Guide

This guide describes the menu settings that should be enabled before photographing the night sky. It intentionally does **not** cover exposure settings (ISO, shutter speed, aperture), since those depend on the scene.

---

# Universal Settings

These settings should generally be enabled regardless of camera brand.

| Setting | Recommended | Why |
|----------|-------------|-----|
| RAW Image | Enabled | Maximum image quality |
| Manual Exposure | M Mode | Full control |
| Manual Focus | MF | Autofocus rarely works on stars |
| Image Stabilization | Off (tripod) | Prevents tripod blur |
| Long Exposure NR | Off | Doubles capture time |
| High ISO NR | Low/Off | Preserve detail |
| Silent Shutter | Off if it causes rolling shutter | Depends on camera |
| Screen Brightness | Low | Preserve night vision |
| LCD Red Mode | Enable if available | Night vision |
| Self Timer / Remote | 2 sec or remote trigger | Avoid vibration |
| Histogram | Enabled | Exposure verification |
| Focus Peaking | Optional | Useful during daylight focusing |
| Magnified Live View | Maximum | Critical focus |

---

# Canon EOS (DSLR)

## Required Settings

### Exposure Simulation
Menu → Shoot → Live View Display

Enable:

- Exposure Simulation
- Always On

Without this, the viewfinder often remains dark.

### Live View Boost
Not available on most DSLRs.

### Viewfinder Brightness

- Auto
- Increase manually if needed

### Magnify

Press:

Magnify (+)

Use 10× zoom on a bright star.

...

---

# Canon EOS R Series

## Display Simulation

Menu

Shooting

Expo. Simulation

Set:

Always On

This is one of the most important settings.

## Night Display

Many EOS R bodies automatically brighten the EVF in low light.

If available:

Display Simulation → ON

### EVF Refresh Rate

Standard

High Frame Rate OFF

High frame rate reduces brightness.

### Manual Focus Guide

Enable if desired.

### Magnify

10× or 15×

---

# Sony Alpha

## Live View Display

Menu

Exposure Setting Effect

ON

Without this, the display won't represent the exposure.

## Finder Frame Rate

Standard

NOT High

Standard produces a brighter EVF.

## Bright Monitoring

Many Sony bodies include:

Bright Monitoring

Assign to a custom button.

This dramatically boosts EVF brightness for composing.

## MF Assist

ON

## Focus Magnifier

Assign to C1/C2.

---

# Nikon DSLR

## Exposure Preview

Enable Live View.

Use Manual Mode.

### Virtual Horizon

Optional

### MF Zoom

Maximum.

...

---

# Nikon Z

## Apply Settings to Live View

ON

### Starlight View

Enable

This is Nikon's dedicated astrophotography display mode.

It greatly brightens the EVF.

### MF Assist

ON

### EVF Brightness

Manual if needed.

---

# Fujifilm X Series

## Preview Exposure

ON

## Natural Live View

OFF

Turning Natural Live View off allows the EVF to simulate exposure.

## Focus Check

ON

## Digital Split Image

Optional

---

# OM System / Olympus

## Live View Boost

ON

This is one of the biggest improvements for astrophotography.

It brightens the display regardless of exposure.

## Starry Sky AF

If available:

ON

Allows autofocus on stars.

## Live Composite

Learn and assign shortcut.

---

# Panasonic Lumix

## Constant Preview

ON

## Live View Boost

ON

## MF Assist

Maximum

## Night Mode

If available

ON

---

# Pentax

## Astrotracer

Enable

Requires GPS.

Tracks stars without an equatorial mount.

## Night Vision LCD

Enable if available.

## Magnified Live View

16×

---

# Leica

## Exposure Preview

ON

## MF Magnification

Maximum

## Focus Peaking

Low

---

# Sigma fp

## Still Mode

Manual

## Display Simulation

ON

## Magnify

Maximum

---

# DJI / Hasselblad

No special astrophotography display settings beyond manual focus and exposure simulation.

---

# Recommended Custom Buttons

| Brand | Button | Function |
|---------|----------|------------|
| Canon | SET | Magnify |
| Sony | C1 | Bright Monitoring |
| Nikon | Fn1 | Starlight View |
| Fuji | Fn | Focus Check |
| Olympus | Fn | Live View Boost |

---

# Features by Brand

| Feature | Canon | Sony | Nikon | Fuji | OM | Panasonic |
|----------|--------|-------|--------|-------|----|------------|
| Exposure Simulation | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| EVF Night Boost | Partial | Bright Monitoring | Starlight View | No | Live View Boost | Live View Boost |
| Star Autofocus | No | Partial | No | No | Yes | No |
| Live Composite | No | No | No | No | Yes | Yes |

`


document.getElementById('content').innerHTML = marked.parse(MD);