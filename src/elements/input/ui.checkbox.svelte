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
        fieldname = "checkbox",
        required = true,
        readonly = false,
        disabled = false,
        valid = true,
        class: classes = "",
        labelClass = "checkbox",
        reactOn = ["onchange", "oninput"],
        ...others
    } = $props();

    let invalid = $derived(!valid);
    const id = `form-field-checkbox-${fieldname}`;

    const optionalProps = {};
    if (typeof others.onchange === "function") {
        const oninput = UICommon.onInput(
            fieldname,
            others.onchange,
            undefined,
            {
                id: others?.id,
            }
        );
        reactOn.forEach((eventName) => (optionalProps[eventName] = oninput));
    }
</script>

<UILabel class={labelClass} {disabled} for={id}>
    {#if readonly}
        <UIBoolean LC_TRUE={label} LC_FALSE={label} {value} />
    {:else}
        <input
            {id}
            class={classes}
            type="checkbox"
            name={fieldname}
            bind:checked={value}
            {required}
            {readonly}
            {invalid}
            {disabled}
            aria-controls="input-field-helper-{fieldname}"
            aria-describedby="input-field-helper-{fieldname}"
            {...optionalProps}
            {...others}
        />
        {$LOCALE[label]}
    {/if}
</UILabel>
