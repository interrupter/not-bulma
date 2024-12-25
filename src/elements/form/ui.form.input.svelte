<script>
    import UILabel from "../input/ui.label.svelte";
    import UIValidatedIcon from "./ui.validated.icon.svelte";
    import { UIIconFont } from "../icon";

    /**
     * @typedef {Object} Props
     * @property {any} [value]
     * @property {boolean} [readonly]
     * @property {object}  UIInput
     * @property {string} [label]
     * @property {string} fieldtype
     * @property {string} fieldname
     * @property {string} [fieldnamePrefix = "form-field-"]
     * @property {string} [icon]
     * @property {boolean} [valid = true]
     * @property {boolean} [validated = false]
     */

    /** @type {Props} */
    let {
        value = $bindable(""),
        readonly,
        UIInput,
        label,
        fieldtype,
        fieldname,
        fieldnamePrefix = "form-field-",
        icon = false,
        valid = true,
        vertical = true,
        validated = false,
        ...others
    } = $props();
</script>

{#snippet input()}
    <!-- readonly UI renderer -->
    <UIInput
        {fieldtype}
        {fieldname}
        {valid}
        {readonly}
        bind:value
        {...others}
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
    {#if vertical}
        <UILabel
            class={fieldtype}
            for="{fieldnamePrefix}{fieldtype}-{fieldname}"
            {label}
        />
        {@render input()}
    {:else}
        <UILabel
            class={fieldtype}
            for="{fieldnamePrefix}{fieldtype}-{fieldname}"
        >
            {label}: {@render input()}
        </UILabel>
    {/if}
{:else}
    {@render input()}
{/if}
