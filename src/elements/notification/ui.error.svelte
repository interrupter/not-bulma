<script>
    import UIMessage from "./ui.message.svelte";
    import UICommon from "../common";

    let { class: classes = UICommon.CLASS_ERR, ...props } = $props();
</script>

<UIMessage {...props} class={classes} />
