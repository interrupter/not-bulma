<script>
    import { preventDefault } from 'svelte/legacy';

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    let { title, id, _id } = $props();

    function click() {
        dispatch("click", {
            _id,
            id,
            title,
        });
    }
</script>

<div
    onclick={preventDefault(click)}
    class="box list-item-selectable"
    onkeyup={click}
    role="button"
    tabindex="0"
>
    <span>{title}</span>
</div>

<style>
    .list-item-selectable {
        cursor: pointer;
        padding: 1em;
    }

    .list-item-selectable:hover {
        background-color: #48c78e;
        color: white;
    }
</style>
