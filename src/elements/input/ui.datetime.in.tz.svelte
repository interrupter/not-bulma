<script>
    import { onMount } from "svelte";
    import UICommon from "../common.js";

    function removeMsFromDate(isoDate, markAsZULU = false) {
        return isoDate.split(".")[0] + (markAsZULU ? "" : "Z");
    }

    function removeSecFromDate(isoDate, markAsZULU = false) {
        return (
            isoDate.slice(0, isoDate.lastIndexOf(":")) + (markAsZULU ? "" : "Z")
        );
    }

    function shiftDatetime(isoDate, shift) {
        try {
            const dateUtc = new Date(markAsZULU(isoDate)).getTime();
            const offset = shift * -60000;
            if (dateIsValid(dateUtc + offset)) {
                const newDate = new Date(dateUtc + offset);
                const newIsoDate = newDate.toISOString();
                return removeSecFromDate(
                    removeMsFromDate(newIsoDate, true),
                    true
                );
            }
        } catch {
            return;
        }
    }

    function markAsZULU(dateString) {
        return dateString && dateString.at(-1) !== "Z"
            ? dateString + "Z"
            : dateString;
    }

    function humanReadable(isoDate) {
        return UICommon.tryFormatLocaleDateTime(isoDate);
    }

    /** @type {import('./type').UIInputProps} */
    let {
        fieldname = "datetimeInTZ",
        value = $bindable(
            removeSecFromDate(removeMsFromDate(new Date().toISOString()))
        ),
        timezoneOffset = 0,
        human = true,
        color,
        size,
        required = false,
        disabled = false,
        readonly = false,
        valid = true,
        class: classes = "",
        onchange = () => true,
        ...others
    } = $props();

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
        } catch {
            return false;
        }
    };

    const changed = () =>
        value !== shiftDatetime(shiftedValue, -timezoneOffset, true);

    const dispatchChange = () => {
        setShifted(shiftedValue);
        value = markAsZULU(shiftDatetime(shiftedValue, -timezoneOffset, true));
        onchange({
            field: fieldname,
            value: $state.snapshot(value),
        });
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

    let invalid = $derived(!valid);
</script>

{#if shiftedValue}
    {#if readonly}
        <p>{humanReadable(shiftedValue)}</p>
    {:else}
        <input
            id="form-field-datetime-in-timezone-{fieldname}"
            class="input {size ? `is-${size}` : ''} {color
                ? `is-${color}`
                : ''} {classes}"
            type="datetime-local"
            name={fieldname}
            bind:value={shiftedValue}
            {invalid}
            {disabled}
            {required}
            {readonly}
            autocomplete={fieldname}
            onchange={onChange}
            onblur={onChange}
            oninput={onChange}
            aria-controls="input-field-helper-{fieldname}"
            aria-describedby="input-field-helper-{fieldname}"
            {...others}
        />
    {/if}
{/if}
