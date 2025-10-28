<script>
    /* eslint svelte/no-at-html-tags: 0 */
    import UIIcon from "../../icon/ui.icon.svelte";
    /**
     * @typedef {Object} Props
     * @property {string} [class]
     */

    /** @type {Props} */
    let { class: classes = "", children, ...other } = $props();
</script>

<div class={"navbar-brand " + classes} {...other}>{@render children?.()}</div>
