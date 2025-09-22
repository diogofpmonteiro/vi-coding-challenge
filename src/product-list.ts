import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { POKEMON_API_BASE_URL } from "./constants";

interface ProductType {
  name: string;
  url: string;
}

@customElement("product-list")
export class ProductList extends LitElement {
  @property({ type: String })
  headline = "";

  @state() private availableTypes: string[] = [];
  @state() private selectedTypes: string[] = [];

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchTypes();
  }

  async fetchTypes() {
    try {
      const response = await fetch(POKEMON_API_BASE_URL + "type");
      const data = await response.json();
      this.availableTypes = data.results
        .filter((type: ProductType) => type.name !== "unknown")
        .map((type: ProductType) => type.name);
    } catch (error) {
      console.error("Failed to load types:", error);
    }
  }

  private handleTypeFilter(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const typeName = checkbox.value;

    if (checkbox.checked) {
      if (this.selectedTypes.length >= 2) {
        checkbox.checked = false;
        return;
      }
      this.selectedTypes = [...this.selectedTypes, typeName];
    } else {
      this.selectedTypes = this.selectedTypes.filter((type) => type !== typeName);
    }
  }

  render() {
    return html`
      <div class="container">
        ${this.headline
          ? html`
              <div class="header">
                <h1>${this.headline}</h1>
              </div>
            `
          : ""}

        <div class="grid-container">
          <div class="filter-section">
            <h3>Filter</h3>
            <div class="filter-group">
              <p>Type</p>
              ${this.availableTypes.map(
                (type) => html`
                  <label>
                    <input type="checkbox" value="${type}" @change=${this.handleTypeFilter} />
                    ${type.charAt(0).toUpperCase() + type.slice(1)}
                  </label>
                `
              )}
            </div>
          </div>
          <div class="content-section"></div>
        </div>
      </div>
    `;
  }

  static styles = css`
    .container {
      gap: 20px;
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      text-align: left;
      margin-bottom: 30px;
    }

    .header h1 {
      font-size: 2rem;
      font-weight: 400;
      margin: 0;
      color: #333;
    }

    .grid-container {
      display: grid;
      grid-template-columns: 1fr 3fr;
      gap: 20px;
      align-items: start;
    }

    .filter-section {
      padding: 20px;
      border-radius: 0px;
      border: 1px solid black;
      height: fit-content;
    }

    .filter-section h3 {
      margin-top: 0;
      margin-bottom: 15px;
      font-size: 1.2rem;
      font-weight: 400;
    }

    .filter-group {
      margin-bottom: 20px;
    }

    .filter-group label {
      display: block;
      margin-bottom: 8px;
      cursor: pointer;
      font-size: 0.9rem;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "product-list": ProductList;
  }
}
