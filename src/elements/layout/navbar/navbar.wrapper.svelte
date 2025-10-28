<script>
    let { class: classes = "", children, ...other } = $props();
</script>

<nav
    class={"navbar " + classes}
    role="navigation"
    aria-label="main navigation"
    {...other}
>
    {@render children?.()}
</nav>
