<script>
    import UIListItem from "./ui.list.item.svelte";
    import UITitle from "../various/ui.title.svelte";

    /**
     * @typedef {Object} Props
     * @property {string} [idFieldName]
     * @property {any} [items]
     * @property {any} [actions]
     * @property {any} [links]
     * @property {string} [itemClasses]
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
        itemClasses = "",
        listItemComponent = UIListItem,
        listItemComponentProps = {},
        titleComponent = UITitle,
        titleComponentProps = { size: 6 },
        descriptionComponent,
        descriptionComponentProps = {},
        imageComponent,
        imageComponentProps = {},
    } = $props();
</script>

{#if items}
    {@const SvelteComponent = listItemComponent}
    {#each items as item, index (item[idFieldName])}
        <SvelteComponent
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
            commonClasses={itemClasses}
            bind:value={items[index]}
            {index}
            first={index === 0}
            last={index === items.length - 1}
            on:click
            on:clickContent
            on:clickDescription
            on:clickImage
            on:clickTitle
        />
    {/each}
{/if}
