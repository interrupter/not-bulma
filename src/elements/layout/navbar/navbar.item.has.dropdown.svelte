<script>
    let {
        hoverable = true,
        dropUp = false,
        boxed = false,
        root = "/",
        onclick,
        label,
        items,
    } = $props();
</script>

<div class="navbar-item has-dropdown" class:is-hoverable={hoverable}>
    {@render label?.({ root, onclick })}
    <div
        class="navbar-dropdown"
        class:is-boxed={boxed}
        class:has-dropdown-up={dropUp}
    >
        {@render items?.({ root, onclick })}
    </div>
</div>
