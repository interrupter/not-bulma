<script>
    import { LOCALE } from "../../../../locale";
    import UIIndicator from "../../../../elements/various/ui.indicator.svelte";

    /**
     * @typedef {Object} Props
     * @property {string} [root]
     * @property {any} [item]
     */

    /** @type {Props} */
    let { root = "", item = {}, onnavigate = () => {} } = $props();

    function onClick(ev) {
        ev.preventDefault();
        onnavigate({
            full: ev.target.getAttribute("href"),
            short: ev.target.dataset.href,
        });
        return false;
    }
</script>

{#if typeof item.href !== "undefined" && item.href !== false}
    <li class={item.classes}>
        <a href="{root}{item.href}" data-href={item.href} onclick={onClick}>
            {$LOCALE[item.title]}
            {#if item.tag}
                <UIIndicator id={item.id} {...item.tag} />
            {/if}
            {#if item.indicator}
                <UIIndicator id={item.id} {...item.indicator} />
            {/if}
        </a>
    </li>
{:else if !item.break}
    <li class="is-no-follow-subtitle {item.classes}">
        {$LOCALE[item.title]}
        {#if item.tag}
            <UIIndicator id={item.id} {...item.tag} />
        {/if}
        {#if item.indicator}
            <UIIndicator id={item.id} {...item.indicator} />
        {/if}
    </li>
{/if}
