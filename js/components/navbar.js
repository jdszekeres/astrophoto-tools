class Navbar extends HTMLElement {
    constructor() {
        super();
        this.page = "";
    }

    connectedCallback() {
        this.innerHTML = `
        <style>
            nav {
                background-color: #333;
                overflow: hidden;
                width: 15vw;
                height: 100vh;

                position: fixed;
                top: 0;
                left: 0;
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
        </style>
        <nav>
            <ul>
                <li><a href="/index.html" class="${this.page === 'home' ? 'active' : ''}">Home</a></li>
                <li><a href="/pages/equivalent_exposures.html" class="${this.page === 'ee' ? 'active' : ''}">Equivalent Exposures</a></li>
            </ul>
        </nav>
        `
        this.style.display = 'block';
        this.style.width = '20vw';
    }

    static get observedAttributes() {
        return ['page'];
    }

}

customElements.define('nav-bar', Navbar);