<script>
    import UIListItem from "./ui.list.item.svelte";
    import UITitle from "../various/ui.title.svelte";
    export let idFieldName = "id";
    export let items = [];
    export let actions = [];
    export let links = [];

    export let itemClasses = "";

    export let listItemComponent = UIListItem;
    export let listItemComponentProps = {};

    export let titleComponent = UITitle;
    export let titleComponentProps = { size: 6 };
    export let descriptionComponent;
    export let descriptionComponentProps = {};
    export let imageComponent;
    export let imageComponentProps = {};
</script>

{#each items as item, index (item[idFieldName])}
    <svelte:component
        this={listItemComponent}
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
        bind:value={item}
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
