<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    import UIButton from "./ui.button.svelte";

    export let values = [];
    export let centered = false;
    export let right = false;
    export let classes = "";
    export let buttonComponent = UIButton;

    export let action = (e) => {
        dispatch("click", e);
    };
</script>

<div
    class="buttons has-addons {centered ? 'is-centered' : ''} {right
        ? 'is-right'
        : ''} {classes}"
>
    {#each values as item (item.id)}
        <svelte:component
            this={buttonComponent}
            {...item}
            bind:value={item.value}
            action={item.action ? item.action : action}
            on:click
        />
    {/each}
</div>
