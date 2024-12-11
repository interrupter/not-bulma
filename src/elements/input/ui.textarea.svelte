<script>
    import { LOCALE } from "../../locale/index";
    import UICommon from "../common.js";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(""),
        placeholder = "",
        fieldname = "textarea",
        rows = 10,
        required = true,
        readonly = false,
        disabled = false,
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
    <textarea
        id="form-field-textarea-{fieldname}"
        class="textarea {classes}"
        name={fieldname}
        bind:value
        {invalid}
        {disabled}
        {required}
        {readonly}
        onblur={oninput}
        placeholder={$LOCALE[placeholder]}
        {rows}
        aria-controls="input-field-helper-{fieldname}"
        aria-describedby="input-field-helper-{fieldname}"
        {...others}
    ></textarea>
{/if}
