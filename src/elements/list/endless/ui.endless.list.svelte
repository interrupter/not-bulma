<script>
    import UIEndlessListSimpleItem from "./ui.endless.list.simple.item.svelte";
    import UIEndlessListEmptyPlaceholder from "../ui.list.empty.placeholder.svelte";
    import UIEndlessListNavigation from "./ui.endless.list.navigation.svelte";

    /**
     * @typedef {Object} Props
     * @property {any} [data]
     * @property {any} [itemComponent] - list element
     * @property {any} [itemComponentProps]
     * @property {any} [emptyListPlaceholderComponent] - if list is empty
     * @property {any} [emptyListPlaceholderComponentProps]
     * @property {any} [listNavigationComponent] - prev and next block
     * @property {any} [listNavigationComponentProps]
     */

    /** @type {Props} */
    let {
        data = $bindable({
            list: [],
            skip: 0,
            count: 0,
            page: 0,
            pages: 0,
        }),
        itemComponent = UIEndlessListSimpleItem,
        itemComponentProps = {},
        emptyListPlaceholderComponent = UIEndlessListEmptyPlaceholder,
        emptyListPlaceholderComponentProps = {},
        listNavigationComponent = UIEndlessListNavigation,
        listNavigationComponentProps = {},
        onselect,
        onprev,
        onnext,
    } = $props();

    const SvelteComponent_2 = $derived(listNavigationComponent);
</script>

<div>
    {#if data.list.length}
        {#each data.list as item (item.id)}
            {@const SvelteComponent = itemComponent}
            <SvelteComponent
                onclick={onselect}
                {...itemComponentProps}
                {...item}
            />
        {/each}
    {:else}
        {@const SvelteComponent_1 = emptyListPlaceholderComponent}
        <SvelteComponent_1 {...emptyListPlaceholderComponentProps} />
    {/if}
</div>
<SvelteComponent_2
    {...listNavigationComponentProps}
    bind:page={data.page}
    bind:pages={data.pages}
    bind:skip={data.skip}
    bind:count={data.count}
    {onprev}
    {onnext}
/>
