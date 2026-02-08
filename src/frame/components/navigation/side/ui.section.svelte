<script>
    import { LOCALE } from "../../../../locale";
    import UIIndicator from "../../../../elements/various/ui.indicator.svelte";
    import UISideMenuItems from "./ui.items.svelte";
    import { COMPONENTS } from "../../../LIB.js";

    /**
     * @typedef {Object} Props
     * @property {any} section
     * @property {string} [root]
     */

    /** @type {Props} */
    let { section, root = "", onnavigate = () => {} } = $props();
</script>

{#if section}
    {#if (section.items && section.items.length) || section.component || section.tag || section.indicator}
        <p class="menu-label {section.classes}">
            {#if section.type === "component" && section.component && COMPONENTS.contains(section.component)}
                {@const SvelteComponent = COMPONENTS.get(section.component)}
                <SvelteComponent id={section.id} {...section.props} />
            {:else}
                {$LOCALE[section.title]}
            {/if}
            {#if section.tag}
                <UIIndicator id={section.id} {...section.tag} />
            {/if}
            {#if section.indicator}
                <UIIndicator id={section.id} {...section.indicator} />
            {/if}
        </p>
    {/if}
{/if}
{#if section.items && section.items.length}
    <UISideMenuItems {root} items={section.items} {onnavigate} />
{/if}
