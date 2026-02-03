<script>
    import { LOCALE } from "../../locale";

    /**
     * @typedef {Object} Props
     * @property {any} id
     * @property {string} [label]
     */

    /** @type {Props} */
    let { id, label = "label" } = $props();
</script>

<label class="label" for={id}>{$LOCALE[label]}</label>
