<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import UISideMenuTrigger from "./ui.trigger.svelte";
    import UISideMenuItems from "./ui.items.svelte";
    import UISideMenuItemLabel from "./ui.item.label.svelte";

    /**
     * @typedef {Object} Props
     * @property {string} [root]
     * @property {any} [item]
     * @property {boolean} [closed]
     */

    /** @type {Props} */
    let { root = "", item = {}, closed = $bindable(false) } = $props();

    function toggle({ detail }) {
        closed = detail.closed;
    }

    function onClick(ev) {
        ev.preventDefault();
        dispatch("navigate", {
            full: ev.target.getAttribute("href"),
            short: ev.target.dataset.href,
        });
        return false;
    }
</script>

<li
    class="{typeof item.url === 'undefined' || item.url === false
        ? ''
        : 'is-no-follow-subtitle'} {item.classes}"
>
    {#if typeof item.url !== "undefined" && item.url !== false}
        <a href="{root}{item.url}" data-href={item.url} onclick={onClick}>
            <UISideMenuItemLabel {item} />
            <UISideMenuTrigger {closed} on:toggle={toggle} />
        </a>
    {:else}
        <UISideMenuItemLabel {item} />
        <UISideMenuTrigger {closed} on:toggle={toggle} />
    {/if}
    <UISideMenuItems {root} items={item.items} {closed} on:navigate />
</li>
