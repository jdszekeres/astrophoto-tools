class Navbar extends HTMLElement {
    constructor() {
        super();
        this.page = this.getAttribute('page') || '';

        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            this.installPromptEvent = event;
            const installButton = document.getElementById('install_button');
            installButton.style.display = 'block';
        });

        
    }


    

    connectedCallback() {
        this.page = this.getAttribute('page') || '';
        this.render();
        this.renderRedLightMode();
        this.style.display = 'block';
        this.style.width = '20vw';
    }
    render() {
        this.renderRedLightMode();
        this.innerHTML = `
        <style>
            nav {
                background-color: #333;
                overflow: hidden;
                width: inherit;
                height: 100vh;

                position: fixed;
                top: 0;
                left: 0;

                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }

            nav ul {
                list-style-type: none;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                
            }

            nav ul li {
                display: block;
            }

            nav ul li a {
                color: white;
                text-align: center;
                padding: 14px 16px;
                text-decoration: none;
                display: block;
            }

            .active {
                background-color: #4CAF50;
                }

                #install_button, #red_light_button {
                margin: 20px;
                padding: 10px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
            }

            #buttons {
                display: flex;
                flex-direction: column;
            }
        </style>
        <nav>
            <ul>
                <li><a href="/index.html" class="${this.page === 'home' ? 'active' : ''}">Home</a></li>
                <li><a href="/pages/equivalent_exposures.html" class="${this.page === 'ee' ? 'active' : ''}">Equivalent Exposures</a></li>
                <li><a href="/pages/bortle.html" class="${this.page === 'bortle' ? 'active' : ''}">Bortle Scale Finder</a></li>
                <li><a href="/pages/bortle_reference.html" class="${this.page === 'bortle_reference' ? 'active' : ''}">Bortle Scale Reference</a></li>
                <li><a href="/pages/sun_and_moon_rise.html" class="${this.page === 'sun_and_moon_rise' ? 'active' : ''}">Sun and Moon Position</a></li>
                <li><a href="/pages/400rule.html" class="${this.page === '400rule' ? 'active' : ''}">400 Rule</a></li>
            </ul>

            <div id="buttons">
                <button id="red_light_button">Red Light Mode</button>
                <button id="install_button" style="display:none;">Install App for Offline Use</button>
            </div>
        </nav>
        `

        setTimeout(() => {
            this.addEventListeners();
        }, 0);
    }
    addEventListeners() {
        document.getElementById('red_light_button').addEventListener('click', () => {
            const isRedLightMode = localStorage.getItem('redLightMode') === 'true';
            localStorage.setItem('redLightMode', !isRedLightMode);
            this.renderRedLightMode();
        });

        document.getElementById('install_button').addEventListener('click', () => {
            if (this.installPromptEvent) {
                this.installPromptEvent.prompt();
                this.installPromptEvent.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }});
            }
        });

    }

    static get observedAttributes() {
        return ['page'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'page') {
            this.page = newValue;
            this.render(); // Re-render the component to update the active link
        }
    }


    renderRedLightMode() {
            const isRedLightMode = localStorage.getItem('redLightMode') === 'true';

            if (isRedLightMode) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = '/css/redlight.css';
                document.head.appendChild(link);
            } else {
                const existingLink = document.querySelector('link[href="/css/redlight.css"]');
                if (existingLink) {
                    existingLink.remove();
                }
            }
        }



}

customElements.define('nav-bar', Navbar);

