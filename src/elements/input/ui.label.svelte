<script>
    import { LOCALE } from "../../locale";

    /**
     * @typedef {Object} Props
     * @property {string} for
     * @property {string} [label='label']
     * @property {string} [class = 'label']
     */

    /** @type {Props} */
    let {
        for: forId,
        label = "label",
        class: labelClass = "label",
        children,
    } = $props();
</script>

<label class={labelClass} for={forId}>
    {#if children}
        {@render children()}
    {:else}{label ? $LOCALE[label] : ""}{/if}
</label>
