import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../../../packages/**/*.mdx",
    "../../../packages/**/*.stories.@(ts|tsx)",
    "../../frontend/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-links"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    const { default: tailwindcss } = await import("@tailwindcss/vite");

    config.plugins ||= [];
    config.plugins.push(tailwindcss());

    return config;
  },
};
export default config;
