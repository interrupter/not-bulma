<script>
    import { LOCALE } from "../../locale/index";
    import UICommon from "../common.js";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(""),
        placeholder = "",
        fieldname = "textarea",
        rows = 10,
        size,
        color,
        required = true,
        readonly = false,
        disabled = false,
        reactOn = ["onblur"],
        valid = true,
        class: classes = "",
        ...others
    } = $props();

    let invalid = $derived(!valid);

    const optionalProps = {};
    if (typeof others.onchange === "function") {
        const oninput = UICommon.onInput(fieldname, others.onchange);
        reactOn.forEach((eventName) => (optionalProps[eventName] = oninput));
    }
</script>

{#if readonly}
    <p>{value}</p>
{:else}
    <textarea
        id="form-field-textarea-{fieldname}"
        class="textarea {size ? `is-${size}` : ''} {color
            ? `is-${color}`
            : ''} {classes}"
        name={fieldname}
        bind:value
        {invalid}
        {disabled}
        {required}
        {readonly}
        placeholder={$LOCALE[placeholder]}
        {rows}
        aria-controls="input-field-helper-{fieldname}"
        aria-describedby="input-field-helper-{fieldname}"
        {...optionalProps}
        {...others}
    ></textarea>
{/if}
