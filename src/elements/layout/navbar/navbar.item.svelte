<script>
    import NavbarItemContent from "./navbar.item.content.svelte";
    import NavbarItemLink from "./navbar.item.link.svelte";
    import NavbarItemText from "./navbar.item.text.svelte";
    import NavbarDevider from "./navbar.devider.svelte";

    let { class: classes = "", children, ...other } = $props();
</script>

{#if other.item.items}
    <NavbarItemContent {...other.item}>{@render children?.()}</NavbarItemContent
    >
{:else if other.item.href}
    <NavbarItemLink {...other.item}>{@render children?.()}</NavbarItemLink>
{:else if other.item.title}
    <NavbarItemText {...other.item}>{@render children?.()}</NavbarItemText>
{:else}
    <NavbarDevider {...other.item}>{@render children?.()}</NavbarDevider>
{/if}
