<script>
    import UILink from "./ui.link.svelte";
    export let values = [];
    export let classes = "";
    export let centered = false;
    export let right = false;
    export let joined = true;
</script>

{#if joined}
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
{:else}
    <div
        class="buttons {centered ? 'is-centered' : ''} {right
            ? 'is-right'
            : ''} {classes}"
    >
        {#each values as item (item.id)}
            <UILink {...item} />
        {/each}
    </div>
{/if}
