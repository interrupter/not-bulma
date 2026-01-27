<script>
    let { classPrefix = "navbar-divider", hidden } = $props();
</script>

<hr class="{classPrefix} {hidden ? `is-hidden-${hidden}` : ''}" />
