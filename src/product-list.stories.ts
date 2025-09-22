import { html } from "lit";
import "./product-list";

// write default storybook story
export default {
  title: "ProductList",
  component: "product-list",
  args: {},
  argTypes: {},
};

export const Default = (args: {}) => html` <product-list></product-list> `;
