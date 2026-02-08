<script>
    import UINavbarItemLink from "./primitives/ui.navbar.item.link.svelte";
    import UINavbarItemWrapper from "./primitives/ui.navbar.item.wrapper.svelte";
    import UINavbarItemContent from "./primitives/ui.navbar.item.content.svelte";
    import UINavbarItemDevider from "./primitives/ui.navbar.item.devider.svelte";

    let { class: classes = "", item, children, url, ...other } = $props();
</script>

{#if item.break}
    <UINavbarItemDevider {...item}></UINavbarItemDevider>
{:else if typeof item.href === "string"}
    <UINavbarItemLink button={false} {...item}
        >{@render children?.()}</UINavbarItemLink
    >
{:else}
    <UINavbarItemWrapper {item}>
        <UINavbarItemContent {item}></UINavbarItemContent>
    </UINavbarItemWrapper>
{/if}
