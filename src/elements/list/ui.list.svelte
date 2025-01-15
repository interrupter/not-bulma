<script>
    import UIListEmptyPlaceholder from "./ui.list.empty.placeholder.svelte";
    import UIListItem from "./ui.list.item.svelte";
    import UIListBlock from "./ui.list.block.svelte";
    import UITitle from "../various/ui.title.svelte";

    //customization

    /**
     * @typedef {Object} Props
     * @property {string} [class = ""]
     * @property {array} [items = []]
     * @property {array} [actions = []]
     * @property {array} [links = []]
     * @property {boolean} [actionsVisible = false]
     * @property {boolean} [itemsHoverable = false]
     * @property {boolean} [overflowEllipsis = false]
     * @property {boolean} [hiddenImages = false]
     * @property {string} [itemClass = '']
     * @property {number} itemLength
     * @property {string} [idFieldName = 'id']
     * @property {function} [emptyListPlaceholderComponent = UIListEmptyPlaceholder] - empty
     * @property {object} [emptyListPlaceholderComponentProps = {}]
     * @property {function} [listItemComponent = UIListItem] - item
     * @property {object} [listItemComponentProps = {}]
     * @property {function} [titleComponent = UITitle] - item parts
     * @property {object} [titleComponentProps = {size: 6}]
     * @property {function} [descriptionComponent]
     * @property {object} [descriptionComponentProps = {}]
     * @property {function} [imageComponent]
     * @property {object} [imageComponentProps = {}]
     * @property {function} [onchange]                  callback
     * @property {function} [onclick]                   callback
     * @property {function} [onclickContent]            callback
     * @property {function} [onclickDescription]        callback
     * @property {function} [onclickImage]              callback
     * @property {function} [onclickTitle]              callback
     */

    /** @type {Props} */
    let {
        class: classes = "",
        items = $bindable([]),
        actions = [],
        links = [],
        actionsVisible = false,
        itemsHoverable = false,
        overflowEllipsis = false,
        hiddenImages = false,
        itemClass = "",
        itemLength,
        idFieldName = "id",
        emptyListPlaceholderComponent:
            UIEmptyListPlaceholderComponent = UIListEmptyPlaceholder,
        emptyListPlaceholderComponentProps = {},
        listItemComponent = UIListItem,
        listItemComponentProps = {},
        titleComponent = UITitle,
        titleComponentProps = { size: 6 },
        descriptionComponent,
        descriptionComponentProps = {},
        imageComponent,
        imageComponentProps = {},
        onchange,
        onclick,
        onclickContent,
        onclickDescription,
        onclickImage,
        onclickTitle,
    } = $props();
</script>

{#if items.length}
    <div
        style={itemLength ? `--length: ${itemLength};` : ""}
        class="list {classes}"
        class:has-visible-pointer-controls={actionsVisible}
        class:has-hoverable-list-items={itemsHoverable}
        class:has-overflow-ellipsis={overflowEllipsis}
        class:has-hidden-images={hiddenImages}
    >
        <UIListBlock
            bind:items
            {itemClass}
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
            {onchange}
            {onclick}
            {onclickContent}
            {onclickDescription}
            {onclickImage}
            {onclickTitle}
        />
    </div>
{:else}
    <UIEmptyListPlaceholderComponent {...emptyListPlaceholderComponentProps} />
{/if}
