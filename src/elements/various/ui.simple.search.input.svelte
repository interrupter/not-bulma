<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import UITextfield from "../input/ui.textfield.svelte";

    import { LOCALE } from "../../locale";

    /**
     * @typedef {Object} Props
     * @property {any} [placeholder]
     * @property {string} [term]
     */

    /** @type {Props} */
    let {
        placeholder = $LOCALE["not-node:field_search_placeholder"],
        term = $bindable(""),
    } = $props();

    function onChange({ detail }) {
        dispatch("termChange", detail);
    }
</script>

<div class="columns">
    <div class="column">
        <div class="field">
            <UITextfield
                bind:value={term}
                {placeholder}
                fieldname="searchTermInput"
                icon="magnifying-glass"
                on:change={onChange}
            />
        </div>
    </div>
</div>
