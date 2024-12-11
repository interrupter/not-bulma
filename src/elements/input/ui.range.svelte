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
        id="form-field-range-{fieldname}"
        class="input big-number slider has-output is-fullwidth is-success {classes}"
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
        onchange={oninput}
        {oninput}
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
