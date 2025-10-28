<script>
    let { class: classes = "", children, ...other } = $props();
</script>

<div class={"navbar-end " + classes} {...other}>
    {@render children?.()}
</div>
