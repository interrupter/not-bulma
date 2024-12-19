<script>
    import UIButtons from "./ui.buttons.svelte";

    /**
     * @typedef {Object} Props
     * @property {string} [class]
     * @property {any} [left]
     * @property {any} [center]
     * @property {any} [right]
     */

    /** @type {Props} */
    let { class: classes = "", left = [], center = [], right = [] } = $props();
</script>

<div class="columns {classes}">
    <div class="column">
        <UIButtons values={left}></UIButtons>
    </div>
    <div class="column">
        <UIButtons values={center} centered={true}></UIButtons>
    </div>
    <div class="column">
        <UIButtons values={right} right={true}></UIButtons>
    </div>
</div>
