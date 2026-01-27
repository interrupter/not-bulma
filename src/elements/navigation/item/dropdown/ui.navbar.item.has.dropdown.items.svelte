<script>
    import UINavbarItem from "../ui.navbar.item.svelte";

    let { items, root, onclick, children } = $props();
</script>

{#if items && items.length}
    {#each items as item (item.id)}
        <UINavbarItem {item}></UINavbarItem>
    {/each}
{:else}
    {@render children?.()}
{/if}
