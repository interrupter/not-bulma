<script>
    let { active } = $props();
</script>

<a
    class="navbar-burger"
    class:is-active={active}
    role="button"
    aria-label="menu"
    aria-expanded="false"
>
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
</a>
