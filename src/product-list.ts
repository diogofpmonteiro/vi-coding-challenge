import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { POKEMON_API_BASE_URL } from "./constants";

@customElement("product-list")
export class ProductList extends LitElement {
  @property({ type: String })
  headline = "";

  @state() private availableTypes: string[] = [];

  async fetchTypes() {
    try {
      const response = await fetch(POKEMON_API_BASE_URL + "type");
      const data = await response.json();
      this.availableTypes = data.results.map((type: any) => type.name);
      console.log(this.availableTypes);
    } catch (error) {
      console.error("Failed to load types:", error);
    }
  }

  render() {
    return html`
      ${this.headline
        ? html`
            <div class="header">
              <h1>${this.headline}</h1>
            </div>
          `
        : ""}
      <div>
        <button @click=${this.fetchTypes}>fetch types</button>
      </div>
    `;
  }

  static styles = css`
    :host {
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "product-list": ProductList;
  }
}
