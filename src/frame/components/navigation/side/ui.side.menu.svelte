<script>
    import UISideMenuSection from "./ui.section.svelte";
    /**
     * @typedef {Object} Props
     * @property {string} [root]
     * @property {any} [items]
     * @property {any} [sections]
     * @property {any} [navigate]
     */

    /** @type {Props} */
    let { root = "", items = [], sections = [], navigate = null } = $props();

    function onClick(ev) {
        if (typeof navigate === "function") {
            navigate(ev.detail);
        }
    }
</script>

{#each sections as section}
    <UISideMenuSection {section} {items} {root} on:navigate={onClick} />
{/each}
