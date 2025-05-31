<script>
    import UICheckboxInput from "./ui.checkbox.svelte";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable([]),
        variants = [],
        fieldname = "checkbox-list",
        ...others
    } = $props();

    function onchange(data, ev, additional) {
        if (!additional) {
            return;
        }
        console.log(data, additional.id);
        if (data.value) {
            if (!value.includes(additional.id)) {
                value.push(additional.id);
            }
        } else {
            if (value.includes(additional.id)) {
                value.splice(value.indexOf(additional.id), 1);
            }
        }
        others?.onchange(
            {
                field: fieldname,
                value: $state.snapshot(value),
            },
            ev,
            additional
        );
    }
</script>

{#each variants as item (item.id)}
    <UICheckboxInput
        {...others}
        {...item}
        fieldname={`${fieldname}-${item.id}`}
        value={value.includes(item.id)}
        {onchange}
    />
{/each}
