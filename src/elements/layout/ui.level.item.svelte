<script>
    export let tag = "div";
</script>

<svelte:element this={tag}>
    <slot><!-- optional fallback --></slot>
</svelte:element>
