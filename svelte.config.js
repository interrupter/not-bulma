export default {
    // Svelte options
    extensions: [".svelte", ".svelte.js"],
    compilerOptions: {},
    preprocess: [],
    onwarn: (warning, handler) => handler(warning),
    // plugin options
    vitePlugin: {
        exclude: [],
        // experimental options
        experimental: {},
    },
};
