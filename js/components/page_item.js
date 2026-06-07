class PageItem extends HTMLElement {
    constructor() {
        super();
        this.name = this.getAttribute('name') || '';
        this.description = this.getAttribute('description') || '';
        this.link = this.getAttribute('link') || '';
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
        <style>
            .page-item {
                border: 1px solid #ccc;
                border-radius: 5px;
                padding: 10px;
                margin: 10px 0;
                width: 30%;
                height: 30%;
                
            }
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