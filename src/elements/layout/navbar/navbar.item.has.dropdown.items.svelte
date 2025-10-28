<script>
    import NavbarItem from "./navbar.item.svelte";

    let { items, root, onclick, children } = $props();
</script>

{#if items && items.length}
    {#each items as item (item.id)}
        <NavbarItem {root} {item} {onclick}></NavbarItem>
    {/each}
{:else}
    {@render children?.()}
{/if}
