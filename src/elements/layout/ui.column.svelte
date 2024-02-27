<script>
    export let classes = "";
    export let title = "";
</script>

<div
    {title}
    class="column {classes}"
    on:click
    on:keyup
    role="button"
    tabindex="0"
>
    <slot />
</div>
