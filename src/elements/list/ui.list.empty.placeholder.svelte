<script>
    import UITitle from "../various/ui.title.svelte";
    /**
     * @typedef {object}    Props
     * @property {string}   [title = "not-node:empty_list_placeholder"]
     * @property {number}   [size = 4]
     * @property {string}   [align = 'center']
     */

    /**
     * @type Props
     */
    let {
        title = "not-node:empty_list_placeholder",
        size = 4,
        align = "center",
        ...others
    } = $props();
</script>

<UITitle {title} {size} {align} {...others} />
