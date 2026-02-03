<script>
    import { run } from "svelte/legacy";

    import { LOCALE } from "../../locale/index";
    const MAX = Number.MAX_SAFE_INTEGER;
    //import "bulma-slider/src/sass/index.sass";

    import UICommon from "../common.js";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import { onMount } from "svelte";

    /**
     * @typedef {Object} Props
     * @property {boolean} [inputStarted]
     * @property {number} [value]
     * @property {number} [min]
     * @property {number} [max]
     * @property {boolean} [tickmarks] - export let step = 1;
     * @property {string} [placeholder]
     * @property {string} [fieldname]
     * @property {boolean} [icon]
     * @property {boolean} [required]
     * @property {boolean} [disabled]
     * @property {boolean} [readonly]
     * @property {boolean} [valid]
     * @property {boolean} [validated]
     * @property {boolean} [errors]
     * @property {boolean} [formErrors]
     * @property {boolean} [formLevelError]
     */

    /** @type {Props} */
    let {
        inputStarted = $bindable(false),
        value = $bindable(10),
        min = 0,
        max = 100,
        tickmarks = false,
        placeholder = "",
        fieldname = "range",
        icon = false,
        required = true,
        disabled = false,
        readonly = false,
        valid = true,
        validated = false,
        errors = false,
        formErrors = false,
        formLevelError = false,
        onchange = () => {},
    } = $props();

    let iconClasses = $derived(
        (icon ? " has-icons-left " : "") + " has-icons-right "
    );
    let allErrors;
    run(() => {
        allErrors = [].concat(
            errors ? errors : [],
            formErrors ? formErrors : []
        );
    });
    let showErrors;
    run(() => {
        showErrors = !(validated && valid) && inputStarted;
    });
    let invalid = $derived(valid === false || formLevelError);
    let validationClasses;
    run(() => {
        validationClasses =
            valid === true || !inputStarted
                ? UICommon.CLASS_OK
                : UICommon.CLASS_ERR;
    });

    function onBlur(ev) {
        const val = getLogarithmicValue(ev.currentTarget.value);
        value = val;
        let data = {
            field: fieldname,
            value,
        };
        inputStarted = true;
        onchange(data);
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
        onchange(data);
        return true;
    }

    let posMin = 0,
        posMax = 100,
        lMin = 0,
        lMax = 100,
        lScale = 10,
        lStep = 0.01,
        posValue = $state(1);

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

    run(() => {
        min, max, updateRange();
    });

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
            onchange={onBlur}
            oninput={onInput}
            aria-describedby="input-field-helper-{fieldname}"
        />
        <output for="form-field-range-{fieldname}" editable="true"
            >{value}</output
        >
        {#if Array.isArray(tickmarks) && tickmarks.length}
            <datalist id="form-field-range-{fieldname}-tickmarks">
                {#each tickmarks as tickmark}
                    <option value={tickmark.value} label={tickmark.label}
                    ></option>
                {/each}
            </datalist>
        {/if}

        {#if icon}
            <span class="icon is-small is-left"
                ><i class="fas fa-{icon}"></i></span
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
