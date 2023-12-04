<script>
    export let id = "";
    export let classes = "";
</script>

<div {id} class="content {classes}" on:click>
    <slot />
</div>
