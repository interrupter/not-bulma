<script>
    import UIListEmptyPlaceholder from "./ui.list.empty.placeholder.svelte";
    import UIListItem from "./ui.list.item.svelte";
    import UIListBlock from "./ui.list.block.svelte";
    import UITitle from "../various/ui.title.svelte";




    //customization
    
    
    
    /**
     * @typedef {Object} Props
     * @property {string} [classes]
     * @property {any} [items]
     * @property {any} [actions]
     * @property {any} [links]
     * @property {boolean} [actionsVisible]
     * @property {boolean} [itemsHoverable]
     * @property {boolean} [overflowEllipsis]
     * @property {boolean} [hiddenImages]
     * @property {string} [itemClasses]
     * @property {any} itemLength
     * @property {string} [idFieldName]
     * @property {any} [emptyListPlaceholderComponent] - empty
     * @property {any} [emptyListPlaceholderComponentProps]
     * @property {any} [listItemComponent] - item
     * @property {any} [listItemComponentProps]
     * @property {any} [titleComponent] - item parts
     * @property {any} [titleComponentProps]
     * @property {any} descriptionComponent
     * @property {any} [descriptionComponentProps]
     * @property {any} imageComponent
     * @property {any} [imageComponentProps]
     */

    /** @type {Props} */
    let {
        classes = "",
        items = $bindable([]),
        actions = [],
        links = [],
        actionsVisible = false,
        itemsHoverable = false,
        overflowEllipsis = false,
        hiddenImages = false,
        itemClasses = "",
        itemLength,
        idFieldName = "id",
        emptyListPlaceholderComponent = UIListEmptyPlaceholder,
        emptyListPlaceholderComponentProps = {},
        listItemComponent = UIListItem,
        listItemComponentProps = {},
        titleComponent = UITitle,
        titleComponentProps = { size: 6 },
        descriptionComponent,
        descriptionComponentProps = {},
        imageComponent,
        imageComponentProps = {}
    } = $props();
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
            {actions}
            {links}
            on:change
            on:click
            on:clickContent
            on:clickDescription
            on:clickImage
            on:clickTitle
        />
    </div>
{:else}
    {@const SvelteComponent = emptyListPlaceholderComponent}
    <SvelteComponent
        {...emptyListPlaceholderComponentProps}
    />
{/if}
