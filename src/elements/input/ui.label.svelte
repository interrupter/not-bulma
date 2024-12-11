<script>
    import { LOCALE } from "../../locale";

    /**
     * @typedef {Object} Props
     * @property {string} for
     * @property {string} [label]
     * @property {string} class
     * @property {boolean}  [disabled = false]
     */

    /** @type {Props} */
    let {
        for: forId,
        label = "label",
        class: labelClass = "label",
        disabled = false,
        children,
    } = $props();
</script>

<label {disabled} class={labelClass} for={forId}>
    {#if children}
        {@render children()}
    {:else}
        {$LOCALE[label]}
    {/if}
</label>
