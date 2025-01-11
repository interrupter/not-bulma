<script>
    import { LOCALE } from "../../locale";
    import UIBoolean from "./ui.boolean.svelte";

    /**
     * @typedef {Object} Props
     * @property {boolean} value
     * @property {boolean} [inverted = false]
     * @property {string} label
     */

    /** @type {Props} */
    let { value, label, inverted = false } = $props();
</script>

<span class="label">{$LOCALE[label]}: <UIBoolean {value} {inverted} /></span>
