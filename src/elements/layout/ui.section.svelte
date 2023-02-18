<script>
    export let id = "";
    export let size; //medium, large
    export let classes = "";
</script>

<section {id} class="section {size ? 'is-' + size : ''}  {classes}" on:click>
    <slot />
</section>
