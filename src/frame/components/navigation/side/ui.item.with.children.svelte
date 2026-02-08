<script>
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
    let {
        root = "",
        item = {},
        closed = $bindable(false),
        onnavigate = () => {},
    } = $props();

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
    class="{typeof item.href === 'undefined' || item.href === false
        ? ''
        : 'is-no-follow-subtitle'} {item.classes}"
>
    {#if typeof item.href !== "undefined" && item.href !== false}
        <a href="{root}{item.href}" data-href={item.href} onclick={onClick}>
            <UISideMenuItemLabel {item} />
            <UISideMenuTrigger {closed} ontoggle={toggle} />
        </a>
    {:else}
        <UISideMenuItemLabel {item} />
        <UISideMenuTrigger {closed} ontoggle={toggle} />
    {/if}
    <UISideMenuItems {root} items={item.items} {closed} {onnavigate} />
</li>
