<script>
    import { LOCALE } from "../../../../locale";

    import UIIcon from "../../../icon/ui.icon.svelte";
    import UITag from "../../../various/ui.tag.svelte";
    import UIIndicator from "../../../various/ui.indicator.svelte";

    import { COMPONENTS } from "../../../../frame/LIB.js";
    let { item, children } = $props();

    /*
  string title
  object icon;
  object tag;
  string type;
  Class component;
  object indicator;
  object options;
  */
</script>

{#if item}
    {#if item.title}
        {$LOCALE[item.title]}
    {/if}
    {#if item.icon}
        <UIIcon {...item.icon} />
    {:else if item.type === "component" && item.component && COMPONENTS.contains(item.component)}
        {@const SvelteComponent = COMPONENTS.get(item.component)}
        <SvelteComponent id={item.id} {...item.props} />
    {/if}

    {#if item.tag}
        <UITag top={true} right={true} size="small" id={item.id} {...item.tag}
        ></UITag>
    {/if}

    {#if item.indicator}
        <UIIndicator id={item.id} {...item.indicator} />
    {/if}
{:else}
    {@render children?.()}
{/if}
