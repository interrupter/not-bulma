<script>
    import UILabel from "./ui.label.svelte";
    import UICommon from "../common.js";

    import "bulma-switch";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable([]),
        variants = [],
        fieldname = "switch",
        required = true,
        readonly = false,
        disabled = false,
        reactOn = ["onblur", "oninput"],
        valid = true,
        class: classes = " is-rounded ",
        onchange = () => true,
        ...others
    } = $props();

    function addId(varId) {
        if (!value.includes(varId)) {
            value.push(varId);
            value = value;
        }
    }

    function remId(varId) {
        if (value.includes(varId)) {
            value.splice(value.indexOf(varId), 1);
            value = value;
        }
    }

    function onChange(eventData, ev) {
        const varId = ev.target.id.split("-variant-").at(-1);
        ev.target.checked ? addId(varId) : remId(varId);
        let data = {
            field: fieldname,
            value: $state.snapshot(value),
        };
        onchange(data);
        return true;
    }

    let invalid = $derived(!valid);

    const optionalProps = {};
    if (typeof others.onchange === "function") {
        const oninput = UICommon.onInput(fieldname, onChange);
        reactOn.forEach((eventName) => (optionalProps[eventName] = oninput));
    }
</script>

{#if readonly}
    {#if value}
        {variants
            .filter((variant) => value.includes(variant.id))
            .map((variant) => variant.title)
            .join(", ")}
    {/if}
{:else}
    {#each variants as variant (variant.id)}
        <div class="switch-list-item">
            <input
                type="checkbox"
                class="switch {classes} {variant.type
                    ? `is-${variant.type}`
                    : ''}"
                id="form-field-switch-{fieldname}-variant-{variant.id}"
                checked={value.includes(variant.id)}
                name={fieldname}
                {disabled}
                {required}
                {readonly}
                {invalid}
                aria-controls="input-field-helper-{fieldname}-variant-{variant.id}"
                aria-describedby="input-field-helper-{fieldname}-variant-{variant.id}"
                {...optionalProps}
                {...others}
            />
            <UILabel
                class="label"
                for="form-field-switch-{fieldname}-variant-{variant.id}"
                label={variant.title}
            />
        </div>
    {/each}
{/if}
