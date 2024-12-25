<script>
    import { LOCALE } from "../../locale";

    /**
     * @typedef {Object} Props
     * @property {string} for
     * @property {string} [label='label']
     * @property {string} [class = '']
     */

    /** @type {Props} */
    let {
        for: forId,
        label = "label",
        class: labelClass = "",
        children,
    } = $props();
</script>

<label class="label {labelClass}" for={forId}>
    {#if children}
        {@render children()}
    {:else}{label ? $LOCALE[label] : ""}{/if}
</label>
