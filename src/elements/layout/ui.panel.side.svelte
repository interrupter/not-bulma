<script>
    let {
        id = "side-menu",
        opened = false,
        class: classes = "menu",
        visibleClass = "is-active",
        hiddenClass = "",
        getActiveClass = () => (opened ? visibleClass : hiddenClass),
        children,
        ...others
    } = $props();

    let activeClass = $derived(getActiveClass(opened));
</script>

<aside {id} class={classes + ` ${activeClass}`} {...others}>
    {@render children?.()}
</aside>
