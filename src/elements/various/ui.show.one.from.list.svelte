<script>
    const defaultFilter = (value) => value[idFieldName] === id;
    export let values = [];
    export let id;
    export let UIComponent;
    export let UIPlaceholder;
    export let active;
    export let idFieldName = "_id";
    export let filter = defaultFilter;

    $: active =
        Array.isArray(values) && values.length && typeof id !== "undefined"
            ? values.find(filter || defaultFilter)
            : undefined;
</script>

{#if active}
    <svelte:component this={UIComponent} {...active} />
{:else if UIPlaceholder}
    <svelte:component this={UIPlaceholder} />
{/if}
