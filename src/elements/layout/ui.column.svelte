<script>
    export let classes = "";
    export let title = "";
    export let narrow = false;
</script>

<div
    {title}
    class="column {classes} {narrow ? 'is-narrow' : ''}"
    on:click
    on:keyup
    role="button"
    tabindex="0"
>
    <slot />
</div>
