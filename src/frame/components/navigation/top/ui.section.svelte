<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import UIItemContent from "./ui.item.content.svelte";
    import UIItem from "./ui.item.svelte";

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
        section = {},
        items = [],
        hidden = "",
        hoverable = true,
        arrowless = false,
        right = false
    } = $props();

    function onClick(event) {
        dispatch("click", { event, element: section });
    }
</script>

{#if items.length}
    <div
        class="navbar-item has-dropdown {hoverable
            ? 'is-hoverable'
            : ''} {hidden ? `is-hidden-${hidden}` : ''} "
    >
        <a
            href
            onclick={onClick}
            class="navbar-link {arrowless ? 'is-arrowless' : ''}"
        >
            <UIItemContent item={section} />
        </a>
        <div class="navbar-dropdown {right ? 'is-right' : ''}">
            {#each items as item (item.id)}
                <UIItem {root} {item} on:click />
            {/each}
        </div>
    </div>
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
    >
        <UIItemContent item={section} />
    </div>
{/if}
