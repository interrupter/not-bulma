<script>
    import UITitle from "../various/ui.title.svelte";
    let {
        title = "not-node:empty_list_placeholder",
        size = 4,
        align = "center",
        ...others
    } = $props();
</script>

<UITitle {title} {size} {align} {...others} />
