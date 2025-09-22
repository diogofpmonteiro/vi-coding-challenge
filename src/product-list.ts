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
  @state() private loading = false;
  @state() private hasMore = true;

  private readonly limit = 20;

  async connectedCallback() {
    super.connectedCallback();
    await this.loadProducts();
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

  private applyProductFilters() {
    if (this.selectedTypes.length === 0) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter((product) =>
        // check if product satisfies all selected types
        this.selectedTypes.every((selected) =>
          // check if this product has at least one type that matches it
          product.types.some((type) => type.type.name === selected)
        )
      );
    }
  }

  private handleTypeFilterClick(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const typeName = checkbox.value;
    const typeLimit = 2;

    if (checkbox.checked) {
      if (this.selectedTypes.length >= typeLimit) {
        checkbox.checked = false;
        return;
      }
      this.selectedTypes = [...this.selectedTypes, typeName];
    } else {
      this.selectedTypes = this.selectedTypes.filter((type) => type !== typeName);
    }
    this.applyProductFilters();
  }

  private async loadProducts() {
    if (this.loading) return;

    this.loading = true;

    try {
      const response = await fetch(`${POKEMON_API_BASE_URL}/pokemon?limit=${this.limit}&offset=${this.offset}`);
      const data: ProductListResponse = await response.json();

      const productDetails = await Promise.all(
        data.results.map(async (product) => {
          const detailRes = await fetch(product.url);
          return await detailRes.json();
        })
      );

      this.products = [...this.products, ...productDetails];
      this.offset += this.limit;
      this.hasMore = data.next !== null;
      this.applyProductFilters();
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      this.loading = false;
    }
  }

  private handleProductClick(productId: number) {
    // for now just log the click since detail pages will be implemented later
    console.log("product clicked:", productId); // redirect user using product id
  }

  private async loadMore() {
    await this.loadProducts();
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
                  <label class="filter-label">
                    <input type="checkbox" value="${type}" @change=${this.handleTypeFilterClick} />
                    ${type.charAt(0).toUpperCase() + type.slice(1)}
                    <span class="type-badge type-${type} type-badge--small"></span>
                  </label>
                `
              )}
            </div>
          </div>
          <div class="product-grid">
            ${this.filteredProducts.map(
              ({ id, sprites, name, types }) => html`
                <div
                  class="product-card"
                  @click=${(e: Event) => {
                    e.preventDefault();
                    this.handleProductClick(id);
                  }}
                >
                  <div class="product-id">#${id}</div>
                  <div class="product-image">
                    <img src="${sprites.front_default || ""}" alt="${name}" loading="lazy" />
                  </div>
                  <div class="product-details">
                    <div class="product-name">${name}</div>
                    <div class="product-types">
                      ${types.map(({ type }) => html` <div class="type-badge type-${type.name}"></div> `)}
                    </div>
                  </div>
                </div>
              `
            )}
            ${this.loading ? html` <div class="loading">Loading...</div> ` : ""}
            ${!this.loading && this.hasMore && this.products.length > 0
              ? html`
                  <div class="load-more">
                    <button @click=${this.loadMore}>Load More</button>
                  </div>
                `
              : ""}
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
      position: sticky;
      top: 20px;
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

    .filter-label {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      cursor: pointer;
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
      text-align: center;
      cursor: pointer;
    }

    .product-image {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      margin: 0 auto 8px;
    }

    .product-image img {
      max-width: 80px;
      max-height: 80px;
    }

    .product-name {
      text-transform: capitalize;
    }

    .product-id {
      text-align: right;
      margin: 8px 8px;
    }

    .product-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid black;
      padding: 8px 16px;
    }

    .product-types {
      display: flex;
      gap: 4px;
    }

    .type-badge {
      padding: 8px;
      border-radius: 50%;
    }

    .type-badge--small {
      width: 14px;
      height: 14px;
      padding: 0;
      border-radius: 50%;
      display: inline-block;
      margin-left: 4px;
    }

    .type-normal {
      background-color: #a8a878;
    }
    .type-fire {
      background-color: #f08030;
    }
    .type-water {
      background-color: #6890f0;
    }
    .type-electric {
      background-color: #f8d030;
    }
    .type-grass {
      background-color: #78c850;
    }
    .type-ice {
      background-color: #98d8d8;
    }
    .type-fighting {
      background-color: #c03028;
    }
    .type-poison {
      background-color: #a040a0;
    }
    .type-ground {
      background-color: #e0c068;
    }
    .type-flying {
      background-color: #a890f0;
    }
    .type-psychic {
      background-color: #f85888;
    }
    .type-bug {
      background-color: #a8b820;
    }
    .type-rock {
      background-color: #b8a038;
    }
    .type-ghost {
      background-color: #705898;
    }
    .type-dragon {
      background-color: #7038f8;
    }
    .type-dark {
      background-color: #705848;
    }
    .type-steel {
      background-color: #b8b8d0;
    }
    .type-fairy {
      background-color: #ee99ac;
    }
    .type-stellar {
      background-color: #42c0a5;
    }

    .load-more {
      grid-column: 1 / -1;
      text-align: center;
      margin-top: 20px;
    }

    .load-more button {
      padding: 12px 24px;
      background: #1976d2;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
    }

    .load-more button:hover {
      background: #1565c0;
    }

    .load-more button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .loading {
      text-align: center;
      padding: 40px;
      font-size: 1.1rem;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "product-list": ProductList;
  }
}
