<script>
    export let classes = "";
    export let title = "";
</script>

<div {title} class="column {classes}" on:click>
    <slot />
</div>
