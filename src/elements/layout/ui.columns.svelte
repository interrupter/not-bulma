<script>
    export let classes = "";
</script>

<div class="columns {classes}" on:click on:keyup role="button" tabindex="0">
    <slot />
</div>
