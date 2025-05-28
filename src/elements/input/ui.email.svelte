<script>
    import { LOCALE } from "../../locale/index";
    import UICommon from "../common.js";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(""),
        placeholder = "",
        fieldname = "email",
        color,
        size,
        required = true,
        readonly = false,
        disabled = false,
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
        id="form-field-email-{fieldname}"
        class="input {size ? `is-${size}` : ''} {color
            ? `is-${color}`
            : ''} {classes}"
        type="email"
        name={fieldname}
        bind:value
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
