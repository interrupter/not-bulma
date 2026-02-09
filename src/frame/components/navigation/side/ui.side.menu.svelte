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
    let {
        root = "",
        items = [],
        navigate = null,
        height,
        marginTop,
        open,
    } = $props();

    function onClick(ev) {
        if (typeof navigate === "function") {
            navigate(ev);
        }
    }
</script>

<aside
    class="menu main-menu"
    id="side-menu"
    style={`height: 100%; ${marginTop};`}
    class:is-active={open}
>
    {#each items as section (section.id)}
        <UISideMenuSection {section} {root} onnavigate={navigate} />
    {/each}
</aside>
