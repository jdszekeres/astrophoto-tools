class PageItem extends HTMLElement {
    constructor() {
        super();
        this.name = this.getAttribute('name') || '';
        this.description = this.getAttribute('description') || '';
        this.link = this.getAttribute('link') || '';
    }

    connectedCallback() {
        this.render();
        this.style.display = 'block';
        this.style.width = 'min(30vw, 30vh)';
        this.style.height = 'min(30vw, 30vh)';
    }

    render() {
        this.innerHTML = `
        <style>
            .page-item {
                border: 1px solid #ccc;
                border-radius: 5px;
                padding: 10px;
                margin: 10px 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            .page-item h2 {
                margin: 0px;
            }

            .page-item p {
                margin: 0px;
            }

            .page-item a {
                display: inline-block;
                margin: 0px;
        </style>
        <div class="page-item">
            <h2>${this.name}</h2>
            <p>${this.description}</p>
            <a href="${this.link}">Go to page</a>
        </div>
        `
    }

        static get observedAttributes() {
        return ['name', 'description', 'link'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'name') {
            this.name = newValue;
        } else if (name === 'description') {
            this.description = newValue;
        }   
        else if (name === 'link') {
            this.link = newValue;
        }

        this.render(); // Re-render the component to update the displayed information
    }
}

customElements.define('page-item', PageItem);