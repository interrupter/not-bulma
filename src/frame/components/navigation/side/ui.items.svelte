<script>
    import Ui_items from "./ui.items.svelte";

    import UISideMenuItemWithoutChildren from "./ui.item.without.children.svelte";

    import UISideMenuTrigger from "./ui.trigger.svelte";
    import UISideMenuItemLabel from "./ui.item.label.svelte";

    let closedChildren = $state({});

    /**
     * @typedef {Object} Props
     * @property {string} [root]
     * @property {any} [items]
     * @property {boolean} [closed]
     */

    /** @type {Props} */
    let {
        root = "",
        items = [],
        closed = false,
        onnavigate = () => {},
    } = $props();

    function onClick(ev) {
        ev.preventDefault();
        onnavigate({
            full: ev.target.getAttribute("href"),
            short: ev.target.dataset.href,
        });
        return false;
    }
</script>

<ul class="menu-list {closed ? 'is-closed' : ''}">
    {#each items as item, index}
        {#if item.items && item.items.length}
            <li class="is-no-follow-subtitle {item.classes}">
                {#if typeof item.href !== "undefined" && item.href !== false}
                    <a
                        href="{root}{item.href}"
                        data-href={item.href}
                        onclick={onClick}
                        class="has-subitems"
                    >
                        <UISideMenuItemLabel {item}>
                            <UISideMenuTrigger
                                ontoggle={(detail) => {
                                    closedChildren[index] = detail.closed;
                                }}
                            />
                        </UISideMenuItemLabel>
                    </a>
                {:else}
                    <UISideMenuItemLabel {item}>
                        <UISideMenuTrigger
                            ontoggle={(detail) => {
                                closedChildren[index] = detail.closed;
                            }}
                        />
                    </UISideMenuItemLabel>
                {/if}
                <Ui_items
                    {root}
                    items={item.items}
                    bind:closed={closedChildren[index]}
                    {onnavigate}
                />
            </li>
        {:else}
            <UISideMenuItemWithoutChildren {root} {item} {onnavigate} />
        {/if}
    {/each}
</ul>
