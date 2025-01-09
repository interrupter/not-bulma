<script>
    import UIEndlessListSimpleItem from "./ui.endless.list.simple.item.svelte";
    import UIEndlessListEmptyPlaceholder from "../ui.list.empty.placeholder.svelte";
    import UIEndlessListNavigation from "./ui.endless.list.navigation.svelte";
    import { UIBlock } from "../../block";

    /**
     * @typedef {Object} Props
     * @property {any} [data]
     * @property {any} [itemComponent = UIEndlessListSimpleItem] - list element
     * @property {any} [itemComponentProps]
     * @property {any} [emptyListPlaceholderComponent = UIEndlessListEmptyPlaceholder] - if list is empty
     * @property {any} [emptyListPlaceholderComponentProps]
     * @property {any} [listNavigationComponent = UIEndlessListNavigation] - prev and next block
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
        itemComponent: UIItemComponent = UIEndlessListSimpleItem,
        itemComponentProps = {},
        emptyListPlaceholderComponent:
            UIEmptyListPlaceholder = UIEndlessListEmptyPlaceholder,
        emptyListPlaceholderComponentProps = {},
        listNavigationComponent:
            UINavigationComponent = UIEndlessListNavigation,
        listNavigationComponentProps = {},
        onselect,
        onprev,
        onnext,
    } = $props();
</script>

<UIBlock>
    {#if data?.list?.length}
        {#each data.list as item (item.id)}
            <UIItemComponent
                onclick={onselect}
                {...itemComponentProps}
                {...item}
            />
        {/each}
    {:else}
        <UIEmptyListPlaceholder {...emptyListPlaceholderComponentProps} />
    {/if}
</UIBlock>
<UINavigationComponent
    {...listNavigationComponentProps}
    bind:page={data.page}
    bind:pages={data.pages}
    bind:skip={data.skip}
    bind:count={data.count}
    {onprev}
    {onnext}
/>
