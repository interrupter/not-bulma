<script>
    let { class: classes = "", children, ...other } = $props();
</script>

<div class={"navbar-item" + classes} {...other}>{@render children?.()}</div>
