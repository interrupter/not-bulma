<script>
    import UILabel from "../../../elements/form/ui.label.svelte";

    import { COMPONENTS } from "../../LIB.js";

    import { createEventDispatcher, onMount } from "svelte";
    let dispatch = createEventDispatcher();

    export let label = "";
    export let name = "generic field";
    export let readonly = false;
    export let horizontal = false;
    export let controls = [];
    //field style modification
    export let classes = "";
    ////addons
    export let addons = false;
    export let addonsCentered = false;
    export let addonsRight = false;
    ////gorup
    export let grouped = false;
    export let groupedMultiline = false;
    export let groupedRight = false;
    export let groupedCentered = false;

    let fieldClasses = "";
    let hidden = false;
    let fieldId;

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

    function onControlChange(ev) {
        let data = ev.detail;
        dispatch("change", data);
    }
</script>

{#if hidden}
    {#each controls as control}
        <svelte:component
            this={COMPONENTS.get(control.component)}
            {...control}
            on:change={onControlChange}
            fieldname={name}
        />
    {/each}
{:else if horizontal}
    <div class="field is-horizontal {fieldClasses} {fieldId}">
        <div class="field-label is-normal">
            <UILabel id={fieldId} label={label || controls[0].label} />
        </div>
        <div class="field-body" id={fieldId}>
            {#each controls as control}
                <svelte:component
                    this={COMPONENTS.get(control.component)}
                    {...control}
                    on:change={onControlChange}
                    fieldname={name}
                />
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
            <svelte:component
                this={COMPONENTS.get(control.component)}
                {...control}
                on:change={onControlChange}
                fieldname={name}
            />
        {/each}
    </div>
{/if}
