<script>

    import {createEventDispatcher} from 'svelte';
    const dispatch = createEventDispatcher();
    
    export let title;
    export let id;
    export let _id;

    function click(){
        dispatch('click', {
            _id,
            id,
            title
        });
    }

</script>

<div on:click|preventDefault={click} class="box list-item-selectable">
    <span>{title}</span>
</div>

<style>
.list-item-selectable{
    cursor: pointer;
    padding: 1em;
}

.list-item-selectable:hover{
    background-color: #48c78e;
    color: white;
}
</style>