<script>
    import Ui_items from "./ui.items.svelte";

    import UISideMenuItemWithoutChildren from "./ui.item.without.children.svelte";

    import UISideMenuTrigger from "./ui.trigger.svelte";
    import UISideMenuItemLabel from "./ui.item.label.svelte";

    /**
     * @typedef {Object} Props
     * @property {string} [root]
     * @property {any} [items]
     * @property {boolean} [closed]
     * @property {function} [onnavigate]
     */

    /** @type {Props} */
    let { root = "", items = [], closed, onnavigate = () => {} } = $props();

    const createClosedItemsLib = (lst) => {
        const lib = {};
        lst.forEach((itm, index) => (lib[index] = itm.closed));
        return lib;
    };

    let closedChildren = $state(createClosedItemsLib(items));

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
                {#if typeof item.url !== "undefined" && item.url !== false}
                    <a
                        href="{root}{item.url}"
                        data-href={item.url}
                        onclick={onClick}
                        class="has-subitems"
                    >
                        <UISideMenuItemLabel {item}>
                            <UISideMenuTrigger
                                bind:closed={closedChildren[index]}
                            />
                        </UISideMenuItemLabel>
                    </a>
                {:else}
                    <UISideMenuItemLabel {item}>
                        <UISideMenuTrigger
                            bind:closed={closedChildren[index]}
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
