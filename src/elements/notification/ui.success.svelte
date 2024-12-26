<script>
    import UIMessage from "./ui.message.svelte";
    import UICommon from "../common";

    let { class: classes = UICommon.CLASS_OK, ...props } = $props();
</script>

<UIMessage {...props} class={classes} />
