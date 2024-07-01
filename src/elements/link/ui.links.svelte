<script>
    import UILink from "./ui.link.svelte";
    export let values = [];
    export let classes = "";
    export let centered = false;
    export let right = false;
</script>

<div
    class="field has-addons {centered ? 'is-centered' : ''} {right
        ? 'is-right'
        : ''} {classes}"
>
    <p class="control">
        {#each values as item (item.id)}
            <UILink {...item} />
        {/each}
    </p>
</div>
