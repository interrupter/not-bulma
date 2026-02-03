<script>
    import UILabel from "../../../elements/form/ui.label.svelte";

    import { COMPONENTS } from "../../LIB.js";

    import { onMount } from "svelte";

    /**
     * @typedef {Object} Props
     * @property {string} [label]
     * @property {string} [name]
     * @property {boolean} [readonly]
     * @property {boolean} [horizontal]
     * @property {any} [controls]
     * @property {string} [classes] - field style modification
     * @property {boolean} [addons] - //addons
     * @property {boolean} [addonsCentered]
     * @property {boolean} [addonsRight]
     * @property {boolean} [grouped] - //gorup
     * @property {boolean} [groupedMultiline]
     * @property {boolean} [groupedRight]
     * @property {boolean} [groupedCentered]
     */

    /** @type {Props} */
    let {
        label = "",
        name = "generic field",
        readonly = false,
        horizontal = false,
        controls = [],
        classes = "",
        addons = false,
        addonsCentered = false,
        addonsRight = false,
        grouped = false,
        groupedMultiline = false,
        groupedRight = false,
        groupedCentered = false,
        onchange = () => {},
    } = $props();

    let fieldClasses = $state("");
    let hidden = $state(false);
    let fieldId = $state();

    onMount(() => {
        fieldClasses += " " + classes;
        fieldClasses += addons ? " has-addons " : "";
        fieldClasses += addonsCentered ? " has-addons-centered " : "";
        fieldClasses += addonsRight ? " has-addons-right " : "";

        fieldClasses += grouped ? " is-grouped " : "";
        fieldClasses += groupedMultiline ? " is-grouped-multiline " : "";
        fieldClasses += groupedRight ? " is-grouped-right " : "";
        fieldClasses += groupedCentered ? " is-grouped-centered " : "";
        if (readonly) {
            controls.forEach((control) => {
                control.readonly = true;
            });
        }
        let notHidden = controls.filter(
            (control) => control.component !== "UIHidden"
        );
        hidden = notHidden.length === 0;
        let tmp = controls.map((itm) => itm.component).join("_");
        fieldId = `form-field-${tmp}-${name}`;
    });
</script>

{#if hidden}
    {#each controls as control}
        {@const SvelteComponent = COMPONENTS.get(control.component)}
        <SvelteComponent {...control} {onchange} fieldname={name} />
    {/each}
{:else if horizontal}
    <div class="field is-horizontal {fieldClasses} {fieldId}">
        <div class="field-label is-normal">
            <UILabel id={fieldId} label={label || controls[0].label} />
        </div>
        <div class="field-body" id={fieldId}>
            {#each controls as control}
                {@const SvelteComponent_1 = COMPONENTS.get(control.component)}
                <SvelteComponent_1 {...control} {onchange} fieldname={name} />
            {/each}
        </div>
    </div>
{:else}
    <div class="field {fieldClasses} {fieldId}">
        {#each controls as control}
            <UILabel
                id="form-field-{control.component}-{name}"
                label={control.label}
            />
            {@const SvelteComponent_2 = COMPONENTS.get(control.component)}
            <SvelteComponent_2 {...control} {onchange} fieldname={name} />
        {/each}
    </div>
{/if}
