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
        fieldname = "textfield",
        required = true,
        readonly = false,
        disabled = false,
        valid = true,
        class: classes = "",
        onchange = () => true,
        ...others
    } = $props();

    let invalid = $derived(!valid);
    const oninput = UICommon.onInput(fieldname, onchange);
</script>

{#if readonly}
    <UIBoolean LC_TRUE={label} LC_FALSE={label} {value} />
{:else}
    {#if !label && !hideLabel}
        <UIBoolean value={false} />
    {/if}
    <input
        id="form-field-switch-{fieldname}"
        class="switch {classes}"
        type="checkbox"
        name={fieldname}
        bind:checked={value}
        placeholder={$LOCALE[placeholder]}
        {disabled}
        {required}
        {readonly}
        {invalid}
        onblur={oninput}
        {oninput}
        aria-controls="input-field-helper-{fieldname}"
        aria-describedby="input-field-helper-{fieldname}"
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
