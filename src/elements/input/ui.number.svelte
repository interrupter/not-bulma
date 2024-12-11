<script>
    import { LOCALE } from "../../locale/index";
    import UICommon from "../common.js";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(0),
        placeholder = "0.0",
        min = 0,
        max = 100,
        step = 1,
        fieldname = "number",
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
        id="form-field-number-{fieldname}"
        class="input {classes}"
        type="number"
        name={fieldname}
        bind:value
        {invalid}
        {disabled}
        {required}
        {readonly}
        {min}
        {max}
        {step}
        placeholder={$LOCALE[placeholder]}
        autocomplete={fieldname}
        onchange={oninput}
        {oninput}
        aria-controls="input-field-helper-{fieldname}"
        aria-describedby="input-field-helper-{fieldname}"
        {...others}
    />
{/if}
