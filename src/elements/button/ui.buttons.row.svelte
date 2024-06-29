<script>
    import UIButtons from "./ui.buttons.svelte";
    export let classes = "";

    export let left = [];
    export let center = [];
    export let right = [];
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
