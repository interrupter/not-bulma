<script>
    import { UIControl } from "../input";
    import UIField from "../input/ui.field.svelte";
    import UITagValue from "./ui.tag.value.svelte";

    /**
     * @typedef {object}    Props
     * @property {array}    values = []
     * @property {boolean}  [grouped = true]
     * @property {boolean}  [multiline = true]
     */

    /**
     * @type   Props
     */
    let { values = [], grouped = true, multiline = true } = $props();
</script>

{#if values.length}
    <UIField {grouped} {multiline}>
        {#each values as tagValueProps}
            <UIControl>
                <UITagValue {...tagValueProps} />
            </UIControl>
        {/each}
    </UIField>
{/if}
