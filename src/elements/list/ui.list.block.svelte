<script>
    import UIListItem from "./ui.list.item.svelte";
    import UITitle from "../various/ui.title.svelte";

    /**
     * @typedef {Object} Props
     * @property {string}   [idFieldName = "id"]
     * @property {array}    [items = []]
     * @property {array}    [actions = []]
     * @property {array}    [links = []]
     * @property {string}   [itemClass = ""]
     * @property {function} [listItemComponent = UIListItem]
     * @property {object}   [listItemComponentProps = {}]
     * @property {function} [titleComponent = UITitle]
     * @property {object}   [titleComponentProps = { size: 6 }]
     * @property {function} descriptionComponent
     * @property {object}   [descriptionComponentProps = {}]
     * @property {function} imageComponent
     * @property {object}   [imageComponentProps = {}]
     * @property {function} [onclick]
     * @property {function} [onclickContent]
     * @property {function} [onclickDescription]
     * @property {function} [onclickImage]
     * @property {function} [onclickTitle]
     */

    /** @type {Props} */
    let {
        idFieldName = "id",
        items = [],
        actions = [],
        links = [],
        itemClass = "",
        listItemComponent: UIListItemComponent = UIListItem,
        listItemComponentProps = {},
        titleComponent = UITitle,
        titleComponentProps = { size: 6 },
        descriptionComponent,
        descriptionComponentProps = {},
        imageComponent,
        imageComponentProps = {},
        onclick,
        onclickContent,
        onclickDescription,
        onclickImage,
        onclickTitle,
    } = $props();
</script>

{#if items}
    {#each items as item, index (item[idFieldName])}
        <UIListItemComponent
            {...listItemComponentProps}
            {titleComponent}
            {titleComponentProps}
            {descriptionComponent}
            {descriptionComponentProps}
            {imageComponent}
            {imageComponentProps}
            {...item}
            listActions={actions}
            listLinks={links}
            bind:value={items[index]}
            commonClass={itemClass}
            {index}
            first={index === 0}
            last={index === items.length - 1}
            {onclick}
            {onclickContent}
            {onclickDescription}
            {onclickImage}
            {onclickTitle}
        />
    {/each}
{/if}
