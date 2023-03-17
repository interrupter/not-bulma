<script>
    import UIListEmptyPlaceholder from "./ui.list.empty.placeholder.svelte";
    import UIListItem from "./ui.list.item.svelte";

    export let classes = "";
    export let items = [];

    export let actionsVisible = false;
    export let itemsHoverable = false;
    export let overflowEllipsis = false;
    export let hiddenImages = false;

    export let itemClasses = "";
    export let itemLength;

    export let emptyListPlaceholderComponent = UIListEmptyPlaceholder;
    export let emptyListPlaceholderComponentProps = {};
</script>

{#if items.length}
    <div
        style={itemLength ? `--length: ${itemLength};` : ""}
        class="list {classes} {actionsVisible
            ? 'has-visible-pointer-controls'
            : ''} {itemsHoverable
            ? 'has-hoverable-list-items'
            : ''} {overflowEllipsis
            ? 'has-overflow-ellipsis'
            : ''} {hiddenImages ? 'has-hidden-images' : ''}"
    >
        {#each items as item (item.id)}
            <UIListItem
                {...item}
                classes={itemClasses}
                on:click
                on:clickContent
                on:clickDescription
                on:clickImage
                on:clickTitle
            />
        {/each}
    </div>
{:else}
    <svelte:component
        this={emptyListPlaceholderComponent}
        {...emptyListPlaceholderComponentProps}
    />
{/if}
