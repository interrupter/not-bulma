<script>
    import UICheckboxInput from "./.ui.checkbox.svelte";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable([]),
        fieldname = "checkbox-list",
        readonly = false,
        disabled = false,
        valid = true,
        onchange = () => true,
        ...others
    } = $props();
</script>

{#each value as item (item.id)}
    <UICheckboxInput
        fieldname={`checkbox-list-${item.id}`}
        {...others}
        {...item}
    />
{/each}
