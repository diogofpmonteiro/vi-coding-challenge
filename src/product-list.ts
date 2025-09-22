import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { POKEMON_API_BASE_URL } from "./constants";

interface Product {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
}
interface ProductType {
  name: string;
  url: string;
}

interface ProductListItem {
  name: string;
  url: string;
}

interface ProductListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductListItem[];
}

@customElement("product-list")
export class ProductList extends LitElement {
  @property({ type: String })
  headline = "";

  @state() private products: Product[] = [];
  @state() private filteredProducts: Product[] = [];
  @state() private availableTypes: string[] = [];
  @state() private selectedTypes: string[] = [];
  @state() private offset = 0;

  private readonly limit = 20;

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchTypes();
    await this.loadProducts();
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

  private async loadProducts() {
    try {
      const response = await fetch(`${POKEMON_API_BASE_URL}/pokemon?limit=${this.limit}&offset=${this.offset}`);
      const data: ProductListResponse = await response.json();
      console.log("data", data);

      const productDetails = await Promise.all(
        data.results.map(async (product) => {
          const detailRes = await fetch(product.url);
          return await detailRes.json();
        })
      );

      console.log("details", productDetails);

      this.products = [...this.products, ...productDetails];
    } catch (error) {
      console.error("Failed to load products", error);
    }
  }

  private handleProductClick(product: Product) {
    // For now, just log the click since detail pages will be implemented later
    console.log("product clicked:", product);
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
          <div class="product-grid">
            ${this.products.map(
              (product) => html`
                <div
                  class="product-card"
                  @click=${(e: Event) => {
                    e.preventDefault();
                    this.handleProductClick(product);
                  }}
                >
                  <div class="product-id">#${product.id}</div>
                  <div class="product-image">
                    <img src="${product.sprites.front_default || ""}" alt="${product.name}" loading="lazy" />
                  </div>
                  <div class="product-name">${product.name}</div>
                  <div class="product-types">
                    ${product.types.map((type) => html` <span> ${type.type.name} </span> `)}
                  </div>
                </div>
              `
            )}
          </div>
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

    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
    }

    .product-card {
      background: white;
      border: 1px solid black;
      padding: 15px;
      text-align: center;
      cursor: pointer;
    }

    .product-image {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      margin: auto;
    }

    .product-image img {
      max-width: 80px;
      max-height: 80px;
    }

    .product-name {
      font-weight: bold;
      margin-bottom: 8px;
      text-transform: capitalize;
    }

    .product-id {
      text-align: right;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "product-list": ProductList;
  }
}
