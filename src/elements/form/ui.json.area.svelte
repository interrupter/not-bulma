<script>
    import UITextarea from "./ui.textarea.svelte";

    import { createEventDispatcher, onMount } from "svelte";
    let dispatch = createEventDispatcher();

    export let inputStarted = false;
    export let value = {};
    export let placeholder = "";
    export let fieldname = "jsonarea";
    export let icon = false;
    export let rows = 10;
    export let required = true;
    export let readonly = false;
    export let disabled = false;
    export let valid = true;
    export let validated = false;
    export let errors = false;
    export let formErrors = false;
    export let formLevelError = false;

    let _value = "{}";

    onMount(() => {
        _value = JSON.stringify(value, null, 4);
    });

    function change() {
        inputStarted = true;
        dispatch("change", {
            field: fieldname,
            value,
        });
    }

    function validateValueAndChange(val) {
        try {
            value = JSON.parse(val);
            valid = true;
            errors = false;
            change();
        } catch (error) {
            valid = false;
            errors = [error.message];
        }
    }

    function onChange(ev) {
        validateValueAndChange(ev.detail.value);
        return true;
    }
</script>

<UITextarea
    bind:inputStarted
    bind:value={_value}
    on:change={onChange}
    {placeholder}
    {icon}
    {rows}
    {required}
    {readonly}
    {disabled}
    {validated}
    {formErrors}
    {formLevelError}
/>
