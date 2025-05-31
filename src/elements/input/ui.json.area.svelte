<script>
    import { onMount } from "svelte";
    import UITextarea from "./ui.textarea.svelte";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable({}),
        fieldname = "jsonarea",
        valid = $bindable(true),
        onchange = () => true,
        onerror = () => {},
        reactOn = ["onblur"],
        colorValid = "success",
        colorInvalid = "danger",
        validationDelay = 1000,
        ...others
    } = $props();

    let _value = $state("{}");

    onMount(() => {
        try {
            _value = JSON.stringify($state.snapshot(value), null, 4);
        } catch {
            _value = "{}";
        }
    });

    let delayedValidation;

    function onChange(val) {
        try {
            value = JSON.parse(val);
            valid = true;
            onchange({
                field: fieldname,
                value: $state.snapshot(value),
            });
        } catch (error) {
            valid = false;
            onerror(error);
        }
        return true;
    }

    function delayedOnChange(data) {
        const { value: val } = data;
        if (delayedValidation) {
            clearTimeout(delayedValidation);
        }
        delayedValidation = setTimeout(() => {
            onChange(val);
        }, validationDelay);
    }

    let color = $derived(valid ? colorValid : colorInvalid);
</script>

<UITextarea
    bind:value={_value}
    {fieldname}
    onchange={delayedOnChange}
    {reactOn}
    {valid}
    {color}
    {...others}
/>
