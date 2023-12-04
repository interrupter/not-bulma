<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    export let id = "";
    export let classes = "";
</script>

<div
    role="button"
    tabindex="0"
    {id}
    class="content {classes}"
    on:click
    on:keyup={() => dispatch("click")}
>
    <slot />
</div>
