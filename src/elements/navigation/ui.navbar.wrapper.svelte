<script>
    let {
        class: classes = "",
        classPrefix = "navbar",
        role = "navigation",
        ariaLabel = "main navigation",
        children,
        ...other
    } = $props();
</script>

<nav
    class={[classPrefix, classes].join(" ")}
    {role}
    aria-label={ariaLabel}
    {...other}
>
    {@render children?.()}
</nav>
