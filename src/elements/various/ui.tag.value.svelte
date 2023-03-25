<script>
    import UITag from "./ui.tag.svelte";

    //if we want to address this tag
    export let id = "taggedValueId";
    export let title; //UITag props
    export let value; //UITag props
    export let classes = "";
</script>

<div class="tags has-addons {classes}" {id}>
    {#if title}
        <UITag {...title} />{/if}{#if value}<UITag {...value} />
    {/if}
</div>
