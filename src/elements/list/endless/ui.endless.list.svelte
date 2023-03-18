<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import UIEndlessListSimpleItem from "./ui.endless.list.simple.item.svelte";
    import UIEndlessListEmptyPlaceholder from "../ui.list.empty.placeholder.svelte";
    import UIEndlessListNavigation from "./ui.endless.list.navigation.svelte";

    export let data = {
        list: [],
        skip: 0,
        count: 0,
        page: 0,
        pages: 0,
    };
    //list element
    export let itemComponent = UIEndlessListSimpleItem;
    export let itemComponentProps = {};
    //if list is empty
    export let emptyListPlaceholderComponent = UIEndlessListEmptyPlaceholder;
    export let emptyListPlaceholderComponentProps = {};
    //prev and next block
    export let listNavigationComponent = UIEndlessListNavigation;
    export let listNavigationComponentProps = {};

    function select({ detail }) {
        dispatch("select", detail);
    }
</script>

<div>
    {#if data.list.length}
        {#each data.list as item (item.id)}
            <svelte:component
                this={itemComponent}
                on:click={select}
                {...itemComponentProps}
                {...item}
            />
        {/each}
    {:else}
        <svelte:component
            this={emptyListPlaceholderComponent}
            {...emptyListPlaceholderComponentProps}
        />
    {/if}
</div>
<svelte:component
    this={listNavigationComponent}
    {...listNavigationComponentProps}
    bind:page={data.page}
    bind:pages={data.pages}
    bind:skip={data.skip}
    bind:count={data.count}
    on:prev
    on:next
/>
