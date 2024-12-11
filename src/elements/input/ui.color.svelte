<script>
    import { LOCALE } from "../../locale/index";
    import { UICommon } from "../..";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(""),
        placeholder = "",
        fieldname = "color",
        disabled = false,
        required = true,
        readonly = false,
        valid = true,
        class: classes = "",
        onchange = () => true,
        ...others
    } = $props();

    let invalid = $derived(!valid);
    const oninput = UICommon.onInput(fieldname, onchange);
</script>

<input
    id="form-field-color-{fieldname}"
    class="input {classes}"
    type="color"
    name={fieldname}
    bind:value
    {invalid}
    {required}
    {readonly}
    {disabled}
    placeholder={$LOCALE[placeholder]}
    autocomplete={fieldname}
    onchange={oninput}
    {oninput}
    aria-controls="input-field-helper-{fieldname}"
    aria-describedby="input-field-helper-{fieldname}"
    {...others}
/>
