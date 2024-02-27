<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import UIItemContent from "./ui.item.content.svelte";
    export let root = "";
    export let item = {};
    export let hidden = "";
    export let classes = "";

    function onClick(event) {
        dispatch("click", { event, element: item });
    }
</script>

{#if item.break}
    <hr class="navbar-divider {hidden ? `is-hidden-${hidden}` : ''} " />
{/if}

{#if item.url}
    <a
        on:click={onClick}
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
        on:click={onClick}
        on:keyup={onClick}
        class="navbar-item {hidden
            ? `is-hidden-${hidden}`
            : ''} {item.classes} {classes}"
    >
        <UIItemContent {item} />
    </div>
{/if}
