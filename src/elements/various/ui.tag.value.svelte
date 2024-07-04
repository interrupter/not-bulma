<script>
    import UITag from "./ui.tag.svelte";
    import UIButtons from "../button/ui.buttons.svelte";

    //if we want to address this tag
    export let id = "taggedValueId";
    export let title; //UITag props
    export let value; //UITag props
    export let actions = []; //UIButtons values or for some custom actionsGroupContructor
    export let classes = "";
    export let actionsGroupContructor = UIButtons;
    export let actionsGroupProps = {};
    export let readonly = false; //hides actions if true
</script>

<div class="tags has-addons {classes}" {id}>
    {#if title}<UITag {...title} />{/if}
    {#if value}<UITag {...value} />{/if}
    {#if !readonly && actions && actions.length}
        <svelte:component
            this={actionsGroupContructor}
            values={actions}
            {...actionsGroupProps}
        />
    {/if}
</div>
