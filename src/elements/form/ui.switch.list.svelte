<script>
    import { run } from "svelte/legacy";

    import { LOCALE } from "../../locale";
    import "bulma-switch";
    import UICommon from "../common.js";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import UIBooleans from "../various/ui.booleans.svelte";

    /**
     * @typedef {Object} Props
     * @property {boolean} [inputStarted]
     * @property {any} [value]
     * @property {any} [variants]
     * @property {string} [label]
     * @property {boolean} [hideLabel]
     * @property {string} [placeholder]
     * @property {string} [fieldname]
     * @property {boolean} [icon]
     * @property {boolean} [required]
     * @property {boolean} [readonly]
     * @property {boolean} [multiple]
     * @property {boolean} [disabled]
     * @property {boolean} [valid]
     * @property {string} [styling]
     * @property {boolean} [validated]
     * @property {boolean} [errors]
     * @property {boolean} [formErrors]
     * @property {boolean} [formLevelError]
     */

    /** @type {Props} */
    let {
        inputStarted = $bindable(false),
        value = $bindable([]),
        variants = [],
        label = "",
        hideLabel = false,
        placeholder = "",
        fieldname = "textfield",
        icon = false,
        required = true,
        readonly = false,
        multiple = true,
        disabled = false,
        valid = true,
        styling = " is-rounded is-success ",
        validated = false,
        errors = false,
        formErrors = false,
        formLevelError = false,
        onchange = () => {},
    } = $props();

    let iconClasses = $derived(
        (icon ? " has-icons-left " : "") + " has-icons-right "
    );
    let allErrors;
    run(() => {
        allErrors = [].concat(
            errors ? errors : [],
            formErrors ? formErrors : []
        );
    });
    let showErrors;
    run(() => {
        showErrors = !(validated && valid) && inputStarted;
    });
    let invalid = $derived(valid === false || formLevelError);
    let validationClasses;
    run(() => {
        validationClasses =
            valid === true || !inputStarted
                ? UICommon.CLASS_OK
                : UICommon.CLASS_ERR;
    });

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

    function onBlur(ev) {
        console.log("switch list element blur", ev);
        const varId = ev.target.id.split("-variant-").at(-1);
        console.log(varId);
        ev.target.checked ? addId(varId) : remId(varId);
        let data = {
            field: fieldname,
            value,
        };
        inputStarted = true;
        onchange(data);
        return true;
    }

    function onInput(ev) {
        console.log("switch list element input", ev);
        const varId = ev.target.id.split("-variant-").at(-1);
        console.log(varId);
        ev.target.checked ? addId(varId) : remId(varId);
        let data = {
            field: fieldname,
            value,
        };
        inputStarted = true;
        onchange(data);
        return true;
    }
</script>

<div class="control">
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
                    class="switch {styling}"
                    id="form-field-switch-{fieldname}-variant-{variant.id}"
                    checked={value.includes(variant.id)}
                    name={fieldname}
                    {disabled}
                    {required}
                    {readonly}
                    {invalid}
                    onblur={onBlur}
                    oninput={onInput}
                    aria-controls="input-field-helper-{fieldname}-variant-{variant.id}"
                    aria-describedby="input-field-helper-{fieldname}-variant-{variant.id}"
                />
                <label
                    class="label"
                    for="form-field-switch-{fieldname}-variant-{variant.id}"
                >
                    {$LOCALE[variant.title]}
                </label>
            </div>
        {/each}
    {/if}
</div>
<ErrorsList
    bind:errors={allErrors}
    bind:show={showErrors}
    bind:classes={validationClasses}
    id="input-field-helper-{fieldname}"
/>
