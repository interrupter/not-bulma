<script>
    import { run } from "svelte/legacy";

    const defaultFilter = (value) => value[idFieldName] === id;
    /**
     * @typedef {Object} Props
     * @property {any} [values]
     * @property {any} id
     * @property {any} UIComponent
     * @property {any} UIPlaceholder
     * @property {any} active
     * @property {string} [idFieldName]
     * @property {any} [filter]
     */

    /** @type {Props} */
    let {
        values = [],
        id,
        UIComponent,
        UIPlaceholder,
        active = $bindable(),
        idFieldName = "_id",
        filter = defaultFilter,
    } = $props();

    $effect(() => {
        active =
            Array.isArray(values) && values.length && typeof id !== "undefined"
                ? values.find(filter || defaultFilter)
                : undefined;
    });
</script>

{#if active}
    <UIComponent {...active} />
{:else if UIPlaceholder}
    <UIPlaceholder />
{/if}
