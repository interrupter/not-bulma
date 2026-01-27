<script>
    let {
        id,
        active,
        classPrefix = "navbar-menu",
        class: classes = "",
        children,
        ...other
    } = $props();

    let classAttr = $derived([classPrefix, classes].join(" "));
</script>

<div {id} class={classAttr} class:is-active={active} {...other}>
    {@render children?.()}
</div>
