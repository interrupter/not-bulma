<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import UIItemContent from "./ui.item.content.svelte";
    /**
     * @typedef {Object} Props
     * @property {string} [root]
     * @property {any} [item]
     * @property {string} [hidden]
     * @property {string} [classes]
     */

    /** @type {Props} */
    let {
        root = "",
        item = {},
        hidden = "",
        classes = ""
    } = $props();

    function onClick(event) {
        dispatch("click", { event, element: item });
    }
</script>

{#if item.break}
    <hr class="navbar-divider {hidden ? `is-hidden-${hidden}` : ''} " />
{/if}

{#if item.url}
    <a
        onclick={onClick}
        class="navbar-item {hidden
            ? `is-hidden-${hidden}`
            : ''} {item.classes} {classes} "
        href="{root}{item.url}"
        data-href={item.url}
    >
        <UIItemContent {item} />
    </a>
{:else}
    <div
        onclick={onClick}
        onkeyup={onClick}
        class="navbar-item {hidden
            ? `is-hidden-${hidden}`
            : ''} {item.classes} {classes}"
    >
        <UIItemContent {item} />
    </div>
{/if}
