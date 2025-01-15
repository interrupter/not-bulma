<script>
    let {
        class: classes = "",
        preventDefault = true,
        click = true,
        enter = true,
        callback,
        children,
        ...others
    } = $props();

    const mouseEvent = (e) => {
        preventDefault && e.preventDefault();
        callback(e);
    };

    const keyboardEvent = (e) => {
        preventDefault && e.preventDefault();
        if (e && e.key == "Enter") {
            callback(e);
        }
    };
</script>

<div
    class={classes}
    role="button"
    tabindex="0"
    onkeyup={enter ? keyboardEvent : undefined}
    onclick={click ? mouseEvent : undefined}
    {...others}
>
    {@render children()}
</div>
