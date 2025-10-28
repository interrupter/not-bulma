<script>
    let { hidden } = $props();
</script>

<hr class="navbar-divider {hidden ? `is-hidden-${hidden}` : ''} " />
