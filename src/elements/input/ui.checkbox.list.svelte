<script>
    import UICheckboxInput from "./.ui.checkbox.svelte";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable([]),
        fieldname = "checkbox-list",
        ...others
    } = $props();
</script>

{#each value as item (item.id)}
    <UICheckboxInput
        fieldname={`${fieldname}-${item.id}`}
        {...others}
        {...item}
    />
{/each}
