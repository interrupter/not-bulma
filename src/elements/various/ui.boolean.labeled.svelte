<script>
    import { LOCALE } from "../../locale";
    import UIBoolean from "./ui.boolean.svelte";

    /**
     * @typedef {Object} Props
     * @property {any} value
     * @property {any} label
     * @property {boolean} [inverted]
     */

    /** @type {Props} */
    let { value, label, inverted = false } = $props();
</script>

<span class="label">{$LOCALE[label]}: <UIBoolean {value} {inverted} /></span>
