<script>
    import { LOCALE } from "../../locale/index";
    import { UICommon } from "../..";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(""),
        placeholder = "",
        fieldname = "color",
        size,
        color,
        disabled = false,
        required = true,
        readonly = false,
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

<input
    id="form-field-color-{fieldname}"
    class="input {size ? `is-${size}` : ''} {color
        ? `is-${color}`
        : ''} {classes}"
    type="color"
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
