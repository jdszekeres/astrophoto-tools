const url_params = new URLSearchParams(window.location.search);

const bortle = url_params.get('bortle');

if (bortle) {
    const image = document.getElementById('bortle-image');

    canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    image.onload = () => {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);

        //draw red rectagle around selected bortle class
        const class_width = canvas.width / 8; //8/9 are combine
        const bortle_clamped = Math.min(Math.max(parseInt(bortle), 1), 8);

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 10;
        ctx.strokeRect((bortle_clamped - 1) * class_width, 5, class_width, canvas.height - 10);
        image.src = canvas.toDataURL();
    };


}