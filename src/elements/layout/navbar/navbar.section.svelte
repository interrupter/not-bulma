<script>
    import NavbarItemHasDropdown from "./navbar.item.has.dropdown.svelte";
    import NavbarItemHasDropdownLabel from "./navbar.item.has.dropdown.label.svelte";
    import NavbarItemHasDropdownItems from "./navbar.item.has.dropdown.items.svelte";
    /**
     * @typedef {Object} Props
     * @property {string} [root]
     * @property {any} [section]
     * @property {any} [items]
     * @property {string} [hidden]
     * @property {boolean} [hoverable]
     * @property {boolean} [arrowless]
     * @property {boolean} [right]
     */

    /** @type {Props} */
    let {
        root = "",
        onclick = () => {},
        section = {},
        items = [],
        hidden = "",
        hoverable = true,
        arrowless = false,
        dropUp = false,
        right = false,
        boxed = false,
    } = $props();
</script>

{#if items.length}
    <NavbarItemHasDropdown
        {hoverable}
        {hidden}
        {arrowless}
        {dropUp}
        {boxed}
        {root}
        {onclick}
    >
        {#snippet label(props)}<NavbarItemHasDropdownLabel
                {...props}
                {...section}
            ></NavbarItemHasDropdownLabel>{/snippet}
        {#snippet items(props)}<NavbarItemHasDropdownItems {...props} {items}
            ></NavbarItemHasDropdownItems>{/snippet}
    </NavbarItemHasDropdown>
{:else if section.url}
    <a
        class="navbar-item {hidden ? `is-hidden-${hidden}` : ''} "
        href="{root}{section.url}"
        data-href={section.url}
        onclick={onClick}
    >
        <UIItemContent item={section} />
    </a>
{:else}
    <div
        class="navbar-item {hidden ? `is-hidden-${hidden}` : ''} "
        onclick={onClick}
        onkeyup={onClick}
        role="button"
        tabindex="0"
    >
        <UIItemContent item={section} />
    </div>
{/if}
