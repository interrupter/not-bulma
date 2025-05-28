<script>
    import { LOCALE } from "../../locale/index";
    import UICommon from "../common.js";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(10),
        min = 0,
        max = 100,
        step = 1,
        tickmarks = false,
        placeholder = "",
        fieldname = "range",
        color,
        size,
        required = true,
        disabled = false,
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

{#if readonly}
    <p>{value}</p>
{:else}
    <input
        id="form-field-range-{fieldname}"
        class="input big-number slider has-output {size
            ? `is-${size}`
            : ''} {color ? `is-${color}` : ''}  {classes}"
        type="range"
        name={fieldname}
        {min}
        {max}
        {step}
        list="form-field-range-{fieldname}-tickmarks"
        {invalid}
        {disabled}
        {required}
        {readonly}
        placeholder={$LOCALE[placeholder]}
        bind:value
        autocomplete={fieldname}
        aria-controls="input-field-helper-{fieldname}"
        aria-describedby="input-field-helper-{fieldname}"
        {...optionalProps}
        {...others}
    />
    <output for="form-field-range-{fieldname}">{value}</output>
    {#if Array.isArray(tickmarks) && tickmarks.length}
        <datalist id="form-field-range-{fieldname}-tickmarks">
            {#each tickmarks as tickmark}
                <option value={tickmark.value} label={tickmark.label}></option>
            {/each}
        </datalist>
    {/if}
{/if}
