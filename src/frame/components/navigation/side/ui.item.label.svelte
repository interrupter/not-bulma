<script>
    import { LOCALE } from "../../../../locale";
    import UIIcon from "../../../../elements/icon/ui.icon.font.svelte";
    import UIIndicator from "../../../../elements/various/ui.indicator.svelte";
    import UITag from "../../../../elements/various/ui.tag.svelte";
    import { COMPONENTS } from "../../../LIB.js";
    let { item = {}, children } = $props();
</script>

{#if item.icon}
    <UIIcon {...item.icon} />
{:else if item.type === "component" && item.component && COMPONENTS.contains(item.component)}
    {@const SvelteComponent = COMPONENTS.get(item.component)}
    <SvelteComponent id={item.id} {...item.props} />
{:else}
    <span class="is-no-link">{$LOCALE[item.title]}</span>
{/if}
{#if item.tag}
    <UITag id={item.id} {...item.tag} />
{/if}
{#if item.indicator}
    <UIIndicator id={item.id} {...item.indicator} />
{/if}
{@render children?.()}
