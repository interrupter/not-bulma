<script>
    import UITagValue from "./ui.tag.value.svelte";

    export let value = [];
</script>

{#each value as tagValueProps}
    <UITagValue {...tagValueProps} />
{/each}
