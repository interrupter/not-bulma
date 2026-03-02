<script>
    import UIButtons from "./ui.buttons.svelte";

    /**
     * @typedef {Object} Props
     * @property {string} [classes]
     * @property {any} [left]
     * @property {any} [center]
     * @property {any} [right]
     */

    /** @type {Props} */
    let {
        classes = "",
        left = [],
        center = [],
        right = [],
        disabled = false,
    } = $props();
</script>

<div class="columns {classes}">
    <div class="column">
        <UIButtons values={left} {disabled}></UIButtons>
    </div>
    <div class="column">
        <UIButtons values={center} centered={true} {disabled}></UIButtons>
    </div>
    <div class="column">
        <UIButtons values={right} right={true} {disabled}></UIButtons>
    </div>
</div>
