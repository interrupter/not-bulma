<script>
    import { getContext, hasContext, onMount } from "svelte";
    let {
        active,
        role = "button",
        classPrefix = "navbar-burger",
        ariaLabel = "menu",
        ariaExpanded = "false",
        dataTarget = "navbarBasicExample",
        class: classes = "",
        onclick = () => {
            console.log("click");
        },
    } = $props();

    onMount(() => {
        if (hasContext("navbarId")) {
            dataTarget = getContext("navbarId");
        }
    });
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<a
    class={[classPrefix, classes].join(" ")}
    class:is-active={active}
    {role}
    aria-label={ariaLabel}
    aria-expanded={ariaExpanded}
    data-target={dataTarget}
    {onclick}
>
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
</a>
