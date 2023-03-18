<script>
    import UITag from "./ui.tag.svelte";

    //if we want to address this tag
    export let id = "taggedValueId";
    export let title; //UITag props
    export let value; //UITag props
</script>

<div class="tags has-addons" {id}>
    {#if title}
        <UITag {...title} />
    {/if}
    {#if value}
        <UITag {...value} />
    {/if}
</div>
