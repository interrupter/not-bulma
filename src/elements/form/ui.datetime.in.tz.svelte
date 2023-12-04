<script>
    import UICommon from "../common";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import { createEventDispatcher, onMount } from "svelte";
    let dispatch = createEventDispatcher();

    function removeMsFromDate(isoDate, markAsZULU = false) {
        return isoDate.split(".")[0] + (markAsZULU ? "" : "Z");
    }

    function shiftDatetime(isoDate, shift) {
        try {
            const dateUtc = new Date(markAsZULU(isoDate)).getTime();
            const offset = shift * -60000;
            if (dateIsValid(dateUtc + offset)) {
                const newDate = new Date(dateUtc + offset);
                const newIsoDate = newDate.toISOString();
                return removeMsFromDate(newIsoDate, true);
            }
        } catch (e) {
            return;
        }
    }

    function markAsZULU(dateString) {
        return dateString && dateString.at(-1) !== "Z"
            ? dateString + "Z"
            : dateString;
    }

    export let inputStarted = false;
    //
    export let fieldname = "datetime";
    export let value = removeMsFromDate(new Date().toISOString()); //ISO 8601 time string
    export let timezoneOffset = 0; //target timezone offset in minutes; target time + timezoneOffset = ZULU time
    //presentation
    export let icon = false;
    export let required = false;
    export let disabled = false;
    export let readonly = false;
    //validation
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

    let shiftedValue, prevShiftedValue;

    const setShifted = (val) => {
        if (dateIsValid(val)) {
            prevShiftedValue = shiftedValue;
            shiftedValue = val;
        }
    };

    const resetShiftedValue = () => {
        shiftedValue = prevShiftedValue;
    };

    onMount(() => {
        setShifted(shiftDatetime(value, timezoneOffset));
    });

    const dateIsValid = (date) => {
        try {
            new Date(date);
            return true;
        } catch (e) {
            return false;
        }
    };
    let GMTMark;
    $: {
        GMTMark = isNaN(timezoneOffset)
            ? ""
            : (timezoneOffset > 0 ? "" : "+") +
              (timezoneOffset / -60).toFixed(1);
    }

    const changed = () =>
        value !== shiftDatetime(shiftedValue, -timezoneOffset, true);

    const dispatchChange = () => {
        setShifted(shiftedValue);
        value = markAsZULU(shiftDatetime(shiftedValue, -timezoneOffset, true));
        let data = {
            field: fieldname,
            value,
        };
        inputStarted = true;
        dispatch("change", data);
    };

    function onChange(ev) {
        if (
            ev.currentTarget.value &&
            shiftedValue &&
            dateIsValid(shiftedValue)
        ) {
            if (changed()) {
                dispatchChange();
            }
            return true;
        } else {
            resetShiftedValue();
        }
        return false;
    }
</script>

{#if shiftedValue}
    <div class="control {iconClasses}">
        {#if readonly}
            <p>{shiftedValue}</p>
        {:else}
            <input
                id="form-field-datetime-in-timezone-{fieldname}"
                class="input {validationClasses}"
                type="datetime-local"
                name={fieldname}
                {invalid}
                {disabled}
                {required}
                {readonly}
                bind:value={shiftedValue}
                autocomplete={fieldname}
                aria-controls="input-field-helper-{fieldname}"
                aria-describedby="input-field-helper-{fieldname}"
                on:change={onChange}
                on:blur={onChange}
                on:input={onChange}
            />
            {#if icon}
                <span class="icon is-small is-left" title={GMTMark}
                    ><i class="fas fa-{icon}" /></span
                >
            {/if}
            {#if validated === true}
                <span class="icon is-small is-right">
                    {#if valid === true}
                        <i class="fas fa-check" />
                    {:else if valid === false}
                        <i class="fas fa-exclamation-triangle" />
                    {/if}
                </span>
            {/if}
        {/if}
    </div>
    <ErrorsList
        bind:errors={allErrors}
        bind:show={showErrors}
        bind:classes={validationClasses}
        id="input-field-helper-{fieldname}"
    />
{/if}
