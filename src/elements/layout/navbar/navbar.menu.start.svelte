<script>
    let { class: classes = "", children, ...other } = $props();
</script>

<div class={"navbar-start " + classes} {...other}>
    {@render children?.()}
</div>
