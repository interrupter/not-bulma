<script>
    let {
        classPrefix = "",
        class: classes = "",
        children,
        ...other
    } = $props();
</script>

<div class={`${classPrefix} ${classes}`} {...other}>
    {@render children?.()}
</div>
