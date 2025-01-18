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
        listItemContentComponent,
        listItemContentComponentProps = {},
        listItemRenderer,
        listItemComponent: UIListItemComponent = UIListItem,
        listItemComponentProps = {},
        titleRenderer,
        titleComponent = UITitle,
        titleComponentProps = { size: 6 },
        descriptionRenderer,
        descriptionComponent,
        descriptionComponentProps = {},
        imageRenderer,
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
        {#if listItemRenderer}
            {@render listItemRenderer(item, index)}
        {:else}
            <UIListItemComponent
                {...listItemComponentProps}
                {listItemContentComponent}
                {listItemContentComponentProps}
                {titleRenderer}
                {titleComponent}
                {titleComponentProps}
                {descriptionRenderer}
                {descriptionComponent}
                {descriptionComponentProps}
                {imageRenderer}
                {imageComponent}
                {imageComponentProps}
                {...items[index]}
                listActions={actions}
                listLinks={links}
                value={items[index].value}
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
        {/if}
    {/each}
{/if}
