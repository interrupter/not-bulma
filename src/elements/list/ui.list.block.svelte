<script>
    import UIListItem from "./ui.list.item.svelte";
    import UITitle from "../various/ui.title.svelte";

    /**
     * @typedef {Object} Props
     * @property {string} [idFieldName]
     * @property {any} [items]
     * @property {any} [actions]
     * @property {any} [links]
     * @property {string} [itemClass]
     * @property {any} [listItemComponent]
     * @property {any} [listItemComponentProps]
     * @property {any} [titleComponent]
     * @property {any} [titleComponentProps]
     * @property {any} descriptionComponent
     * @property {any} [descriptionComponentProps]
     * @property {any} imageComponent
     * @property {any} [imageComponentProps]
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
