<script>
    import { LOCALE } from "../../locale/index";
    const MAX = Number.MAX_SAFE_INTEGER;
    //import "bulma-slider/src/sass/index.sass";

    import UICommon from "../common.js";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import { createEventDispatcher, onMount } from "svelte";
    let dispatch = createEventDispatcher();

    export let inputStarted = false;
    export let value = 10;
    export let min = 0;
    export let max = 100;
    //export let step = 1;
    export let tickmarks = false;
    export let placeholder = "";
    export let fieldname = "range";
    export let icon = false;
    export let required = true;
    export let disabled = false;
    export let readonly = false;
    export let valid = true;
    export let validated = false;
    export let errors = false;
    export let formErrors = false;
    export let formLevelError = false;

    $: iconClasses = (icon ? " has-icons-left " : "") + " has-icons-right ";
    $: allErrors = [].concat(
        errors ? errors : [],
        formErrors ? formErrors : []
    );
    $: showErrors = !(validated && valid) && inputStarted;
    $: invalid = valid === false || formLevelError;
    $: validationClasses =
        valid === true || !inputStarted
            ? UICommon.CLASS_OK
            : UICommon.CLASS_ERR;

    function onBlur(ev) {
        const val = getLogarithmicValue(ev.currentTarget.value);
        value = val;
        let data = {
            field: fieldname,
            value,
        };
        inputStarted = true;
        dispatch("change", data);
        return true;
    }

    function onInput(ev) {
        const val = getLogarithmicValue(
            Math.round(parseInt(ev.currentTarget.value))
        );
        value = val;
        let data = {
            field: fieldname,
            value,
        };
        inputStarted = true;
        dispatch("change", data);
        return true;
    }

    let posMin = 0,
        posMax = 100,
        lMin = 0,
        lMax = 100,
        lScale = 10,
        lStep = 0.01,
        posValue = 1;

    function updateRange() {
        lMin = Math.log(min || 1);
        lMax = Math.log(max || MAX);
        lScale = (lMax - lMin) / (posMax - posMin);
        if (value > max) {
            value = max;
        } else if (value < min) {
            value = min;
        } else {
            value = value;
        }
    }

    $: {
        min, max, updateRange();
    }

    onMount(() => {
        updateRange();
    });

    function getLogarithmicValue(pos) {
        pos = parseInt(pos);
        return Math.round(Math.exp((pos - posMin) * lScale + lMin));
    }

    function getLogarithmicPosition(val) {
        val = parseInt(val);
        return posMin + (Math.log(val) - lMin) / lScale;
    }
</script>

<div class="control {iconClasses}">
    {#if readonly}
        <p>{value}</p>
    {:else}
        <input
            id="form-field-range-{fieldname}"
            class="input big-number slider has-output is-fullwidth is-success {validationClasses}"
            type="range"
            name={fieldname}
            min={posMin}
            max={posMax}
            step={lStep}
            list="form-field-range-{fieldname}-tickmarks"
            {invalid}
            {disabled}
            {required}
            {readonly}
            placeholder={$LOCALE[placeholder]}
            bind:value={posValue}
            autocomplete={fieldname}
            aria-controls="input-field-helper-{fieldname}"
            on:change={onBlur}
            on:input={onInput}
            aria-describedby="input-field-helper-{fieldname}"
        />
        <output for="form-field-range-{fieldname}" editable="true"
            >{value}</output
        >
        {#if Array.isArray(tickmarks) && tickmarks.length}
            <datalist id="form-field-range-{fieldname}-tickmarks">
                {#each tickmarks as tickmark}
                    <option value={tickmark.value} label={tickmark.label} />
                {/each}
            </datalist>
        {/if}

        {#if icon}
            <span class="icon is-small is-left"
                ><i class="fas fa-{icon}" /></span
            >
        {/if}
    {/if}
</div>
<ErrorsList
    bind:errors={allErrors}
    bind:show={showErrors}
    bind:classes={validationClasses}
    id="input-field-helper-{fieldname}"
/>
