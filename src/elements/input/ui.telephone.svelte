<script>
    import { LOCALE } from "../../locale/index";
    import UICommon from "../common.js";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(""),
        placeholder = "+7 (987) 654-32-10",
        fieldname = "telephone",
        required = true,
        disabled = false,
        readonly = false,
        valid = true,
        class: classes = "",
        onchange = () => true,
        ...others
    } = $props();

    let invalid = $derived(!valid);
    const oninput = UICommon.onInput(fieldname, onchange);
</script>

{#if readonly}
    <p>{value}</p>
{:else}
    <input
        id="form-field-telephone-{fieldname}"
        class="input {classes}"
        type="tel"
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
{/if}
