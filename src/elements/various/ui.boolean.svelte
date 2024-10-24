<script>
    import UITag from "./ui.tag.svelte";


    /**
     * @typedef {Object} Props
     * @property {string} [LC_TRUE]
     * @property {string} [LC_FALSE]
     * @property {any} value
     * @property {boolean} [inverted]
     */

    /** @type {Props} */
    let {
        LC_TRUE = "not-node:booleans_true",
        LC_FALSE = "not-node:booleans_false",
        value,
        inverted = false
    } = $props();

    const FALSE_VALUE = {
        title: LC_FALSE,
        color: inverted ? "success" : "danger",
    };

    const TRUE_VALUE = {
        title: LC_TRUE,
        color: inverted ? "danger" : "success",
    };

    //if inverted === true, inverts value
    let tagValue = $derived(value ? TRUE_VALUE : FALSE_VALUE);
</script>

<UITag {...tagValue} />
