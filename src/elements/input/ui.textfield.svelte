<script>
    import { LOCALE } from "../../locale/index";
    import UICommon from "../common.js";

    let inp = $state();

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(""),
        placeholder = "",
        fieldname = "textfield",
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
        id="form-field-textfield-{fieldname}"
        class="input {classes}"
        type="text"
        name={fieldname}
        bind:value
        {invalid}
        {disabled}
        {required}
        {readonly}
        placeholder={$LOCALE[placeholder]}
        autocomplete={fieldname}
        onchange={oninput}
        {oninput}
        aria-controls="input-field-helper-{fieldname}"
        aria-describedby="input-field-helper-{fieldname}"
        {...others}
    />
{/if}
