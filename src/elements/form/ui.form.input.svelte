<script>
    import UILabel from "../input/ui.label.svelte";
    import UIValidatedIcon from "./ui.validated.icon.svelte";
    import { UIIconFont } from "../icon";

    /**
     * @typedef {Object} Props
     * @property {any} [value]
     * @property {object}
     * @property {string} [label]
     * @property {string} [placeholder]
     * @property {string} fieldname
     * @property {string} fieldtype
     * @property {boolean} [icon]
     * @property {boolean} [required]
     * @property {boolean} [readonly]
     * @property {boolean} [disabled]
     * @property {import('../events.types').UIEventInputChangeCallback} [onchange]
     * @property {boolean} [valid]
     */

    /** @type {Props} */
    let {
        value = $bindable(""),
        UIInput,
        label,
        placeholder = "",
        fieldtype,
        fieldname,
        fieldnamePrefix = "form-field-",
        icon = false,
        required = true,
        readonly = false,
        disabled = false,
        valid = true,
        onchange = () => true,
    } = $props();
</script>

{#snippet input()}
    <!-- readonly UI renderer -->
    <UIInput
        {fieldtype}
        {fieldname}
        {valid}
        {disabled}
        {required}
        {readonly}
        {placeholder}
        {onchange}
        bind:value
    />
    <!-- edit UI renderer -->
    {#if icon}
        <UIIconFont font={icon} side={"left"} size={"small"} />
    {/if}
    {#if !readonly}
        <!-- validated and valid should be created by $state() -->
        <UIValidatedIcon {validated} {valid}></UIValidatedIcon>
    {/if}
{/snippet}

{#if label}
    <UILabel
        class={fieldtype}
        {disabled}
        for="{fieldnamePrefix}{fieldtype}-{fieldname}"
    >
        {@render input()}
    </UILabel>
{:else}
    {@render input()}
{/if}
