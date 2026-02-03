<script>
    import { run } from "svelte/legacy";

    import UICommon from "../common";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import { onMount } from "svelte";

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

    /**
     * @typedef {Object} Props
     * @property {boolean} [inputStarted]
     * @property {string} [fieldname]
     * @property {any} [value]
     * @property {number} [timezoneOffset]
     * @property {boolean} [icon] - presentation
     * @property {boolean} [required]
     * @property {boolean} [disabled]
     * @property {boolean} [readonly]
     * @property {boolean} [valid] - validation
     * @property {boolean} [validated]
     * @property {boolean} [errors]
     * @property {boolean} [formErrors]
     * @property {boolean} [formLevelError]
     */

    /** @type {Props} */
    let {
        inputStarted = $bindable(false),
        fieldname = "datetime",
        value = $bindable(removeMsFromDate(new Date().toISOString())),
        timezoneOffset = 0,
        icon = false,
        required = false,
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

    let shiftedValue = $state(),
        prevShiftedValue;

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
    let GMTMark = $derived(
        isNaN(timezoneOffset)
            ? ""
            : (timezoneOffset > 0 ? "" : "+") +
                  (timezoneOffset / -60).toFixed(1)
    );

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
        onchange(data);
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
                onchange={onChange}
                onblur={onChange}
                oninput={onChange}
            />
            {#if icon}
                <span class="icon is-small is-left" title={GMTMark}
                    ><i class="fas fa-{icon}"></i></span
                >
            {/if}
            {#if validated === true}
                <span class="icon is-small is-right">
                    {#if valid === true}
                        <i class="fas fa-check"></i>
                    {:else if valid === false}
                        <i class="fas fa-exclamation-triangle"></i>
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
