<script>
    /**
     * @typedef {Object} Props
     * @property {string} [tag]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { tag = "div", children } = $props();
</script>

<svelte:element this={tag}>
    {#if children}{@render children()}{:else}<!-- optional fallback -->{/if}
</svelte:element>
