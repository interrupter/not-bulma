<script>
    let { id, active, class: classes = "", children, ...other } = $props();
</script>

<div
    id={"navbar-" + id}
    class={"navbar-menu " + classes}
    class:is-active={active}
    {...other}
>
    {@render children?.()}
</div>
