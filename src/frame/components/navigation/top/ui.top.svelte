<!-- @migration-task Error while migrating Svelte code: Can't migrate code with beforeUpdate. Please migrate by hand. -->
<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import SideMenu from "../side";

    import UIBrand from "./ui.brand.svelte";
    import UINavbarItem from "./ui.item.svelte";
    import UINavbarSection from "./ui.section.svelte";
    import UINavbarBurger from "./ui.burger.svelte";
    

    /**
     * @typedef {Object} Props
     * @property {any} [sections] - import { beforeUpdate } from "svelte";
     * @property {any} [items]
     * @property {string} [root]
     * @property {any} [navigate]
     * @property {boolean} [brand]
     * @property {boolean} [showBurger]
     * @property {boolean} [burgerControlsSidemenu]
     */

    /** @type {Props} */
    let {
        sections = [],
        items = [],
        root = "",
        navigate = null,
        brand = false,
        showBurger = true,
        burgerControlsSidemenu = true
    } = $props();

    let menuClosed = $state(true);

    function onClick({ detail }) {
        let { event, element } = detail;
        if (Object.hasOwn(element, "action")) {
            return element.action(event, element);
        }
        event.preventDefault();
        if (typeof navigate === "function") {
            navigate({
                full: event.currentTarget.getAttribute("href"),
                short: event.currentTarget.dataset.href,
            });
        }
        return false;
    }

    let sectionsItemsCount = {};
    let sectionsItems = {};
    /*
    beforeUpdate(() => {
        for (let section of sections) {
            sectionsItems[section.id] = items.filter(
                (t) => t.section === section.id
            );
            sectionsItemsCount[section.id] = items.filter(
                (t) => t.section === section.id
            ).length;
        }
    });
*/
    function toggleBurger({ detail }) {
        if (burgerControlsSidemenu) {
            SideMenu.toggle();
        } else {
            dispatch("toggleBurger", detail);
            menuClosed = detail.closed;
        }
    }
</script>

<div class="navbar-brand">
    {#if brand}
        <UIBrand {...brand} />
    {/if}
    {#each sections as section (section.id)}
        {#if section.showOnTouch}
            <UINavbarItem
                hidden="desktop"
                item={section}
                {root}
                on:click={onClick}
            />
        {/if}
    {/each}
    {#each items as item (item.id)}
        {#if item.showOnTouch}
            <UINavbarItem hidden="desktop" {item} {root} on:click={onClick} />
        {/if}
    {/each}
    {#if showBurger}
        <UINavbarBurger on:toggle={toggleBurger} />
    {/if}
</div>
<div id="navbar" class="navbar-menu {menuClosed ? '' : 'is-active'}">
    <div class="navbar-start">
        {#each items as item}
            {#if item.place === "start"}
                <UINavbarItem hidden="touch" {item} on:click={onClick} />
            {/if}
        {/each}
    </div>
    <div class="navbar-end">
        {#each sections as section (section.id)}
            {#if (sectionsItemsCount[section.id] || section.indicator || section.tag) && section.place == "end"}
                <UINavbarSection
                    right={true}
                    hidden={section.hidden}
                    {root}
                    {section}
                    items={sectionsItems[section.id]}
                    on:click={onClick}
                />
            {/if}
        {/each}
    </div>
</div>
