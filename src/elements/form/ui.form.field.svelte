<script>
    let { class: classes = "", children, ...others } = $props();
</script>

<div class="field {classes}" {...others}>{@render children()}</div>
