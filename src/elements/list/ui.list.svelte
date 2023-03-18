<script>
    import UIListEmptyPlaceholder from "./ui.list.empty.placeholder.svelte";
    import UIListItem from "./ui.list.item.svelte";
    import UIListBlock from "./ui.list.block.svelte";
    import UITitle from "../various/ui.title.svelte";

    export let classes = "";
    export let items = [];

    export let actionsVisible = false;
    export let itemsHoverable = false;
    export let overflowEllipsis = false;
    export let hiddenImages = false;

    export let itemClasses = "";
    export let itemLength;
    export let idFieldName = "id";
    //customization
    //empty
    export let emptyListPlaceholderComponent = UIListEmptyPlaceholder;
    export let emptyListPlaceholderComponentProps = {};
    //item
    export let listItemComponent = UIListItem;
    export let listItemComponentProps = {};
    //item parts
    export let titleComponent = UITitle;
    export let titleComponentProps = { size: 6 };
    export let descriptionComponent;
    export let descriptionComponentProps = {};
    export let imageComponent;
    export let imageComponentProps = {};
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
        <UIListBlock
            bind:items
            {itemClasses}
            {listItemComponent}
            {listItemComponentProps}
            {idFieldName}
            {titleComponent}
            {titleComponentProps}
            {descriptionComponent}
            {descriptionComponentProps}
            {imageComponent}
            {imageComponentProps}
            on:click
            on:clickContent
            on:clickDescription
            on:clickImage
            on:clickTitle
        />
    </div>
{:else}
    <svelte:component
        this={emptyListPlaceholderComponent}
        {...emptyListPlaceholderComponentProps}
    />
{/if}
