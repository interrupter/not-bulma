<script>
    import UILink from "../../../link/ui.link.svelte";
    let {
        classPrefix = "navbar-item",
        class: classes = "",
        children,
        target = "_self",
        ...other
    } = $props();
</script>

<UILink class={[classPrefix, classes].join(" ")} {target} {...other}
    >{@render children?.()}</UILink
>
