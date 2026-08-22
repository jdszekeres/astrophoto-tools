document.addEventListener("DOMContentLoaded", function () {
    const content = document.querySelector('.content');
    const contentWidth = content.offsetWidth;
    const contentHeight = content.offsetHeight;

    const twentyVW = window.innerWidth * 0.2;

    const numStars = 100;

    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        const size = Math.random() * 2 + 1; // Random size between 1 and 3
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        const x = Math.random() * contentWidth;
        const y = Math.random() * contentHeight;
        star.style.left = `${twentyVW + x}px`;
        star.style.top = `${y}px`;

        content.appendChild(star);
    }
    
    // add comet
    setInterval(() => {
        const comet = document.createElement('div');
        comet.classList.add('comet');
        comet.classList.add('star');

        const size = Math.random() * 10 + 2; // Random size between 2 and 5
        comet.style.width = `${size}px`;
        comet.style.height = `${size}px`;

        const x = Math.random() * contentWidth;
        const y = Math.random() * contentHeight;
        comet.style.left = `${twentyVW + x}px`;
        comet.style.top = `${y}px`;

        comet.style.zIndex = '0'; // Ensure comet is above stars

        //add moving animation to comet
        comet.style.animation = `moveComet 2s linear forwards`;

        content.appendChild(comet);

        // Remove comet after 2 seconds
        setTimeout(() => {
            comet.remove();
        }, 2000);
    }, 5000); // Every 5 seconds
    
})