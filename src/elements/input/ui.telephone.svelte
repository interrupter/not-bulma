<script>
    import { LOCALE } from "../../locale/index";
    import UICommon from "../common.js";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(""),
        placeholder = "+7 987 654-32-10",
        pattern = "\\+[0-9]{1,3}\\s+[0-9]{3}\\s+[0-9]{3}-[0-9]{2}-[0-9]{2}",
        fieldname = "telephone",
        required = true,
        disabled = false,
        readonly = false,
        color,
        size,
        valid = true,
        class: classes = "",
        ...others
    } = $props();

    let invalid = $derived(!valid);
    const optionalProps = {};
    if (typeof others.onchange === "function") {
        const oninput = UICommon.onInput(fieldname, others.onchange);
        optionalProps.onchange = oninput;
        optionalProps.oninput = oninput;
    }
</script>

{#if readonly}
    <p>{value}</p>
{:else}
    <input
        id="form-field-telephone-{fieldname}"
        class="input {size ? `is-${size}` : ''} {color
            ? `is-${color}`
            : ''} {classes}"
        type="tel"
        name={fieldname}
        bind:value
        {pattern}
        {invalid}
        {required}
        {readonly}
        {disabled}
        placeholder={$LOCALE[placeholder]}
        autocomplete={fieldname}
        aria-controls="input-field-helper-{fieldname}"
        aria-describedby="input-field-helper-{fieldname}"
        {...optionalProps}
        {...others}
    />
{/if}
