<script>
    /* eslint svelte/no-at-html-tags: 0 */
    import UINavbarBrandWrapper from "./ui.navbar.brand.wrapper.svelte";
    import UINavbarBrandItem from "./ui.navbar.brand.item.svelte";

    /**
     * @typedef {Object} Props
     * @property {object} brand             brand data object
     * @property {function} [children]      additional nodes snippets, for optional burger
     */

    /** @type {Props} */
    let { brand, children } = $props();
</script>

<UINavbarBrandWrapper>
    <UINavbarBrandItem {...brand}></UINavbarBrandItem>
    {@render children?.()}
</UINavbarBrandWrapper>
