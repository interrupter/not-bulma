<script>
    const defaultFilter = (value) => value[idFieldName] === id;

    /**
     * @typedef {Object} Props
     * @property {string|number}    id                          id of active item
     * @property {array}            [values = []]               list of items
     * @property {function}         UIComponent                 component to show active item
     * @property {function}         component                   snippet to show active item
     * @property {function}         UIPlaceholder               placeholder if active is unset
     * @property {function}         placeholder                 snippet to show placeholder
     * @property {object}           [placeholderProps = {}]     placeholder props
     * @property {object}           [active = {}]               current active element
     * @property {string}           [idFieldName = "_id"]       name of item property used as identificator
     * @property {function}         [filter = (value) => value[idFieldName] === id] filtering function to select active item. default is to search for item with selected id
     */

    /** @type {Props} */
    let {
        id,
        values = [],
        active = $bindable({}),
        idFieldName = "_id",
        filter = defaultFilter,
        UIComponent,
        component,
        UIPlaceholder,
        placeholder,
        placeholderProps,
    } = $props();

    $effect(() => {
        active =
            Array.isArray(values) && values.length && typeof id !== "undefined"
                ? values.find(filter || defaultFilter)
                : undefined;
    });
</script>

{#if active}
    {#if component}
        {@render component(active)}
    {:else if UIComponent}
        <UIComponent {...active} />
    {/if}
{:else if UIPlaceholder}
    {#if placeholder}
        {@render placeholder(placeholderProps)}
    {:else if UIPlaceholder}
        <UIPlaceholder {...placeholderProps} />
    {/if}
{/if}
