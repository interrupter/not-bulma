<script>
    /**
     * @component
     * checkbox with true or false values
     **/
    import { LOCALE } from "../../locale";
    import UICommon from "../common";

    import UILabel from "./ui.label.svelte";
    import UIBoolean from "../various/ui.boolean.svelte";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(false),
        label = "checkbox",
        placeholder = "",
        fieldname = "checkbox",
        required = true,
        readonly = false,
        disabled = false,
        valid = true,
        class: classes = "",
        labelClass = "",
        onchange = () => true,
        ...others
    } = $props();

    let invalid = $derived(!valid);
    const id = `form-field-checkbox-${fieldname}`;

    const oninput = UICommon.onInput(fieldname, onchange);
</script>

<UILabel class={labelClass} {disabled} for={id}>
    {#if readonly}
        <UIBoolean LC_TRUE={label} LC_FALSE={label} {value} />
    {:else}
        <input
            {id}
            class="input {classes}"
            type="checkbox"
            name={fieldname}
            bind:checked={value}
            placeholder={$LOCALE[placeholder]}
            {required}
            {readonly}
            {invalid}
            {disabled}
            onchange={oninput}
            {oninput}
            aria-controls="input-field-helper-{fieldname}"
            aria-describedby="input-field-helper-{fieldname}"
            {...others}
        />
        {$LOCALE[label]}
    {/if}
</UILabel>
