<script>
    let {
        classPrefix = "navbar-link",
        class: classes = "",
        children,
        selected,
        ...other
    } = $props();
</script>

<a
    class={[classPrefix, classes].join(" ")}
    class:is-selected={selected}
    {...other}>{@render children?.()}</a
>
