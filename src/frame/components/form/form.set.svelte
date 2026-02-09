<script>
    import UIButtons from "../../../elements/button/ui.buttons.svelte";

    import { onMount } from "svelte";

    /**
     * @typedef {Object} Props
     * @property {string} [name]
     * @property {boolean} [showModes]
     * @property {string} [mode]
     * @property {any} [forms]
     */

    /** @type {Props} */
    let {
        name = "default-form",
        showModes = false,
        mode = $bindable("default"),
        forms = [],
        onmode = () => {},
    } = $props();

    function setMode(val) {
        mode = val;
        onmode(val);
        updateModesButtons();
    }

    let FORMS_BUTTONS = $state([]);

    function updateModesButtons() {
        FORMS_BUTTONS = forms
            .filter((form) => {
                return mode !== form.mode;
            })
            .map((form, index) => {
                return {
                    id: index,
                    title: form.title,
                    outlined: true,
                    type: "link",
                    action() {
                        setMode(form.mode);
                    },
                };
            });
    }

    onMount(() => {
        updateModesButtons();
    });
</script>

<div class="block-container" id="{name}-form-set">
    <div class="form-paper" id="{name}-form-set-container"></div>
    {#if showModes}
        <UIButtons centered={true} values={FORMS_BUTTONS} classes="mt-4" />
    {/if}
</div>
