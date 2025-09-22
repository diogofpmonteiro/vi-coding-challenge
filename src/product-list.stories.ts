import { html } from "lit";
import "./product-list";
import { POKEMON_API_BASE_URL } from "./constants";

const createFetchMock = () => {
  const originalFetch = window.fetch;

  const mockList = {
    count: 3,
    next: null,
    previous: null,
    results: [
      { name: "bulbasaur", url: `${POKEMON_API_BASE_URL}/pokemon/1/` },
      { name: "charmander", url: `${POKEMON_API_BASE_URL}/pokemon/4/` },
      { name: "squirtle", url: `${POKEMON_API_BASE_URL}/pokemon/7/` },
    ],
  };

  const mockTypes = {
    results: [
      { name: "grass", url: `${POKEMON_API_BASE_URL}/type/12/` },
      { name: "poison", url: `${POKEMON_API_BASE_URL}/type/4/` },
      { name: "fire", url: `${POKEMON_API_BASE_URL}/type/10/` },
      { name: "water", url: `${POKEMON_API_BASE_URL}/type/11/` },
    ],
  };

  const detailById: Record<string, any> = {
    "1": {
      id: 1,
      name: "bulbasaur",
      sprites: { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" },
      types: [{ type: { name: "grass" } }, { type: { name: "poison" } }],
    },
    "4": {
      id: 4,
      name: "charmander",
      sprites: { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png" },
      types: [{ type: { name: "fire" } }],
    },
    "7": {
      id: 7,
      name: "squirtle",
      sprites: { front_default: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png" },
      types: [{ type: { name: "water" } }],
    },
  };

  const mock = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url.startsWith(`${POKEMON_API_BASE_URL}/pokemon?`)) {
      return new Response(JSON.stringify(mockList), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (url.startsWith(`${POKEMON_API_BASE_URL}/type`)) {
      return new Response(JSON.stringify(mockTypes), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const match = url.match(/\/pokemon\/(\d+)\/?$/);
    if (match) {
      const id = match[1];
      const data = detailById[id];
      if (data) {
        return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
      }
    }

    return originalFetch(input, init);
  };

  // override global fetch to mock method (runtime override) to simulate API response
  return { install: () => (window.fetch = mock as any), restore: () => (window.fetch = originalFetch) };
};

export default {
  title: "Components/ProductList",
  component: "product-list",
  args: {
    headline: "Our Products",
  },
  argTypes: {
    headline: { control: "text" },
  },
  decorators: [
    (story: any) => {
      const { install } = createFetchMock();
      // call install() to override fetch during runtime
      install();
      return story();
    },
  ],
};

export const Default = (args: { headline?: string }) => html`
  <product-list headline="${args.headline ?? ""}"></product-list>
`;

export const WithCustomHeadline = (Default as any).bind({});
(WithCustomHeadline as any).args = { headline: "Starter Pokémon" };
