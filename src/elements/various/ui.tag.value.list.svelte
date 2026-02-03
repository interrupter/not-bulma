<script>
    import UITagValue from "not-bulma/src/elements/various/ui.tag.value.svelte";

    let { value = [] } = $props();
</script>

{#if value.length}
    <div class="field is-grouped is-grouped-multiline">
        {#each value as tagValueProps}
            <div class="control">
                <UITagValue {...tagValueProps} />
            </div>
        {/each}
    </div>
{/if}
