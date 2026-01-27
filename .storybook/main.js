/** @type { import('@storybook/svelte-vite').StorybookConfig } */
const config = {
    staticDirs: [{ from: "../examples/dist/assets", to: "/assets" }],
    stories: [
        "../src/**/*.mdx",
        "../src/**/*.stories.@(js|ts|svelte)",
        "../src/elements/**/*.stories.@(js|ts|svelte)",
        "../src/elements/**/**/*.stories.@(js|ts|svelte)",
        "../src/elements/**/**/**/*.stories.@(js|ts|svelte)",
    ],
    addons: [
        "@storybook/addon-svelte-csf",
        "@chromatic-com/storybook",
        "@storybook/addon-docs",
        "@storybook/addon-a11y",
        "@storybook/addon-vitest",
    ],
    framework: {
        name: "@storybook/svelte-vite",
        options: { legacyTemplate: false },
    },
};
export default config;
