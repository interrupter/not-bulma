<script>
    import Ui_items from "./ui.items.svelte";
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

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
    let { root = "", items = [], closed = false } = $props();

    function onClick(ev) {
        ev.preventDefault();
        dispatch("navigate", {
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
                                on:toggle={({ detail }) => {
                                    closedChildren[index] = detail.closed;
                                }}
                            />
                        </UISideMenuItemLabel>
                    </a>
                {:else}
                    <UISideMenuItemLabel {item}>
                        <UISideMenuTrigger
                            on:toggle={({ detail }) => {
                                closedChildren[index] = detail.closed;
                            }}
                        />
                    </UISideMenuItemLabel>
                {/if}
                <Ui_items
                    {root}
                    items={item.items}
                    bind:closed={closedChildren[index]}
                    on:navigate
                />
            </li>
        {:else}
            <UISideMenuItemWithoutChildren {root} {item} on:navigate />
        {/if}
    {/each}
</ul>
