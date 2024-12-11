<script>
    import { LOCALE } from "../../locale";
    import UICommon from "../common.js";

    /** @type {import('./type').UIInputProps} */
    let {
        inputStarted = $bindable(false),
        value = $bindable(""),
        placeholder = "",
        fieldname = "password",
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
    id="form-field-password-{fieldname}"
    class="input {classes}"
    type="password"
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
