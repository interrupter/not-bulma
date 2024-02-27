<script>
    export let id = "";
    export let size; //medium, large
    export let classes = "";
    export let tabindex = 0;
</script>

<section
    {id}
    class="section {size ? 'is-' + size : ''}  {classes}"
    on:click
    on:keyup
    role="button"
    {tabindex}
>
    <slot />
</section>
