<script>
    import { onMount, hasContext, getContext } from "svelte";

    let {
        hoverable = true,
        dropUp = false,
        boxed = false,
        right = false,
        root = "/",
        onclick,
        label,
        items,
    } = $props();

    onMount(() => {
        if (hasContext("root")) {
            root = getContext("root");
        }
        if (hasContext("onclick")) {
            onclick = getContext("onclick");
        }
    });
</script>

<div class="navbar-item has-dropdown" class:is-hoverable={hoverable}>
    {@render label?.({ root, onclick })}
    <div
        class="navbar-dropdown"
        class:is-boxed={boxed}
        class:is-right={right}
        class:has-dropdown-up={dropUp}
    >
        {@render items?.({ root, onclick })}
    </div>
</div>
