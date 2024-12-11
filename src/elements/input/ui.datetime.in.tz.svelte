<script>
    import UICommon from "../common";

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

    /** @type {import('./type').UIInputProps} */
    let {
        fieldname = "datetime",
        value = $bindable(removeMsFromDate(new Date().toISOString())),
        timezoneOffset = 0,
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
        } catch (e) {
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
            value,
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
</script>

{#if shiftedValue}
    {#if readonly}
        <p>{shiftedValue}</p>
    {:else}
        <input
            id="form-field-datetime-in-timezone-{fieldname}"
            class="input {classes}"
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
