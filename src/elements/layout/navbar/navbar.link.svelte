<script>
    let { children, ...other } = $props();
</script>

<a class="navbar-link" class:is-selected={other.selected} {...other}
    >{@render children?.()}</a
>
