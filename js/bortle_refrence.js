const url_params = new URLSearchParams(window.location.search);

const bortle = url_params.get('bortle');


const image = document.getElementById('bortle-image');

image.addEventListener('load', () => {
    //create an image map with 8 equal sections corresponding to the 8 classes of the bortle scale
    const class_width = image.clientWidth / 8;
    const map = document.querySelector('map[name="bortle-map"]');
    for (let i = 0; i < 8; i++) {
        const area = document.createElement('area');
        area.shape = 'rect';
        area.coords = `${i * class_width},0,${(i + 1) * class_width},${image.naturalHeight}`;
        area.href = `/pages/bortle_reference.html?bortle=${i + 1}`;
        area.alt = `Bortle Class ${i + 1}`;
        map.appendChild(area);
    }
});


if (bortle) {

    const levelDescriptor = document.querySelector('ol li:nth-child(' + bortle + ')');
    if (levelDescriptor) {
        levelDescriptor.style.fontWeight = 'bold';
        levelDescriptor.style.textDecoration = 'underline';
        levelDescriptor.style.color = 'red';
    }

    const image = document.getElementById('bortle-image');

    canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    image.addEventListener('load', () => {
        //highlight the section corresponding to the bortle class in red
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
    });


}