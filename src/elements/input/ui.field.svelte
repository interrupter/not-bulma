<script>
    let {
        grouped = false,
        multiline = false,
        class: classes = "",
        children,
        ...others
    } = $props();
</script>

<div
    class="field {classes}"
    class:is-grouped={grouped}
    class:is-multiline={multiline}
    {...others}
>
    {@render children()}
</div>
