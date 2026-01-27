<script>
    import UINavbarItem from "./ui.navbar.item.svelte";
    import UINavbarItemSection from "./ui.navbar.item.section.svelte";

    let { item, ...others } = $props();
</script>

{#if Object.hasOwn(item, "items") && Array.isArray(item.items) && item.items.length}
    <UINavbarItemSection renderer={UINavbarItem} {item} {...others}
    ></UINavbarItemSection>
{:else}
    <UINavbarItem {item} {...others}></UINavbarItem>
{/if}
