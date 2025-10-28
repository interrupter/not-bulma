<script>
    import NavbarLink from "./navbar.link.svelte";
    import NavbarItem from "./navbar.item.svelte";

    let { label } = $props();
</script>

{#if typeof label === "string"}
    <NavbarLink>{label}</NavbarLink>
{:else if typeof label === "object"}
    <NavbarItem {...label}></NavbarItem>
{:else if typeof label === "function"}
    {@render label?.()}
{/if}
