<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let id = "";
    export let classes = "";
</script>

<div
    {id}
    class="box {classes} "
    on:click
    on:keyup={() => dispatch("click")}
    role="button"
>
    <slot />
</div>
