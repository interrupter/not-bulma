<script>
    import { LOCALE } from "../../locale/index";
    import UICommon from "../common.js";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(""),
        placeholder = "",
        fieldname = "textfield",
        required = true,
        disabled = false,
        size = "normal",
        readonly = false,
        valid = true,
        color,
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
        id="form-field-textfield-{fieldname}"
        class="input {size ? `is-${size}` : ''} {color
            ? `is-${color}`
            : ''} {classes}"
        type="text"
        name={fieldname}
        bind:value
        {invalid}
        {disabled}
        {required}
        {readonly}
        placeholder={$LOCALE[placeholder]}
        autocomplete={fieldname}
        aria-controls="input-field-helper-{fieldname}"
        aria-describedby="input-field-helper-{fieldname}"
        {...optionalProps}
        {...others}
    />
{/if}
