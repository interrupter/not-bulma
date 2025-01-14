<script>
    let {
        grouped = false,
        addons = false,
        multiline = false,
        class: classes = "",
        children,
        ...others
    } = $props();
</script>

<div
    class="field {classes}"
    class:has-addons={addons}
    class:is-grouped={grouped}
    class:is-multiline={multiline}
    {...others}
>
    {@render children()}
</div>
