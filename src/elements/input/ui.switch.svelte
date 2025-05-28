<script>
    import "bulma-switch";
    import { LOCALE } from "../../locale/index";
    import UICommon from "../common.js";
    import UIBoolean from "../various/ui.boolean.svelte";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(false),
        label = "",
        hideLabel = false,
        placeholder = "",
        fieldname = "switch",
        size,
        color,
        required = true,
        readonly = false,
        disabled = false,
        reactOn = ["onblur", "oninput"],
        valid = true,
        class: classes = "",
        ...others
    } = $props();

    let invalid = $derived(!valid);

    const optionalProps = {};
    if (typeof others.onchange === "function") {
        const oninput = UICommon.onInput(fieldname, others.onchange);
        reactOn.forEach((eventName) => (optionalProps[eventName] = oninput));
    }
</script>

{#if readonly}
    <UIBoolean LC_TRUE={label} LC_FALSE={label} {value} />
{:else}
    {#if !label && !hideLabel}
        <UIBoolean value={false} />
    {/if}
    <input
        id="form-field-switch-{fieldname}"
        class="switch {size ? `is-${size}` : ''} {color
            ? `is-${color}`
            : ''} {classes}"
        type="checkbox"
        name={fieldname}
        bind:checked={value}
        placeholder={$LOCALE[placeholder]}
        {disabled}
        {required}
        {readonly}
        {invalid}
        aria-controls="input-field-helper-{fieldname}"
        aria-describedby="input-field-helper-{fieldname}"
        {...optionalProps}
        {...others}
    />
    <label class="label" for="form-field-switch-{fieldname}">
        {#if !hideLabel}
            {#if label}
                {$LOCALE[label]}
            {:else}
                <UIBoolean value={false} />
            {/if}
        {/if}
    </label>
{/if}
