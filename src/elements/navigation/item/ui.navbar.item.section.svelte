<script>
    import NavbarItemHasDropdown from "./dropdown/ui.navbar.item.has.dropdown.svelte";
    import NavbarItemHasDropdownLabel from "./dropdown/ui.navbar.item.has.dropdown.label.svelte";
    import NavbarItemHasDropdownItems from "./dropdown/ui.navbar.item.has.dropdown.items.svelte";
    /**
     * @typedef {Object} Props
     * @property {string} [root]
     * @property {any} [item]
     * @property {string} [hidden]
     * @property {boolean} [hoverable]
     * @property {boolean} [arrowless]
     * @property {boolean} [right]
     */

    /** @type {Props} */
    let {
        root = "",
        onclick = () => {},
        item,
        renderer,
        hidden = "",
        hoverable = true,
        arrowless = false,
        dropUp = false,
        right = false,
        boxed = false,
    } = $props();
</script>

{#if item && Object.hasOwn(item, "items") && Array.isArray(item.items) && item.items.length}
    <NavbarItemHasDropdown
        {hoverable}
        {hidden}
        {arrowless}
        {dropUp}
        {boxed}
        {root}
        {onclick}
        {right}
    >
        {@debug item}
        {#snippet label(props)}<NavbarItemHasDropdownLabel
                {...props}
                item={{ ...item, items: null }}
            ></NavbarItemHasDropdownLabel>{/snippet}
        {#snippet items(props)}<NavbarItemHasDropdownItems
                {...props}
                items={item.items}
            ></NavbarItemHasDropdownItems>{/snippet}
    </NavbarItemHasDropdown>
{/if}
