<script>
    import UINavbarItemContent from "../primitives/ui.navbar.item.content.svelte";
    import UINavbarItemGeneric from "../ui.navbar.item.generic.svelte";
    import { LOCALE } from "../../../../locale";

    let { item, label, ...others } = $props();
</script>

{#if !others.arrowless}
    <!-- svelte-ignore a11y_missing_attribute -->
    <a class="navbar-link">{$LOCALE[item.title || label]}</a>
{:else if typeof label === "string"}
    <UINavbarItemContent {...others}>{label}</UINavbarItemContent>
{:else if typeof item === "object"}
    <UINavbarItemGeneric {item}></UINavbarItemGeneric>
{:else if typeof label === "function"}
    {@render label?.()}
{/if}
