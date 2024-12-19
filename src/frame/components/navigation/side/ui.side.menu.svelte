<script>
    import UISideMenuSection from "./ui.section.svelte";
    /**
     * @typedef {Object} Props
     * @property {string} [root]
     * @property {any} [items]
     * @property {any} [sections]
     * @property {any} [navigate = ()=>undefined]
     */

    /** @type {Props} */
    let { root = "", items = [], sections = [], navigate = null } = $props();

    function onClick(ev) {
        if (typeof navigate === "function") {
            navigate(ev);
        }
    }
</script>

{#each sections as section}
    <UISideMenuSection {section} {items} {root} onnavigate={onClick} />
{/each}
