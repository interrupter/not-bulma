<script>
    import { LOCALE } from "../../locale/index";
    import UICommon from "../common.js";
    import { onMount } from "svelte";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(new Date()),
        placeholder = "",
        fieldname = "datetime",
        pattern = "d{4}-d{2}-d{2}",
        required = true,
        disabled = false,
        readonly = false,
        valid = true,
        class: classes = "",
        onchange = () => true,
        ...others
    } = $props();

    onMount(() => {
        if (value instanceof Date) {
            value = value.toISOString().split("T")[0];
        } else if (value.indexOf("T") > 0) {
            value = value.split("T")[0];
        }
    });

    let invalid = $derived(!valid);
    const oninput = UICommon.onInput(fieldname, onchange);
</script>

{#if readonly}
    <p>
        <time datetime={value}>{UICommon.tryFormatLocaleDateTime(value)}</time>
    </p>
{:else}
    <input
        id="form-field-date-{fieldname}"
        class="input {classes}"
        type="date"
        name={fieldname}
        bind:value
        {invalid}
        {required}
        {readonly}
        {disabled}
        placeholder={$LOCALE[placeholder]}
        {pattern}
        autocomplete={fieldname}
        onchange={oninput}
        {oninput}
        aria-controls="input-field-helper-{fieldname}"
        aria-describedby="input-field-helper-{fieldname}"
        {...others}
    />
{/if}
