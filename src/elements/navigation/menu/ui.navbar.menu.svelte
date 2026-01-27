<script>
    import { onMount, getContext, hasContext } from "svelte";

    import UINavbarItemGeneric from "../item/ui.navbar.item.generic.svelte";

    import UINavbarMenuWrapper from "./ui.navbar.menu.wrapper.svelte";
    import UINavbarMenuStart from "./ui.navbar.menu.start.svelte";
    import UINavbarMenuEnd from "./ui.navbar.menu.end.svelte";

    let {
        id,
        active,
        items = [],
        root,
        onclick,
        class: classes = "",
        children,
        ...other
    } = $props();

    onMount(() => {
        if (hasContext("navbarId")) {
            id = getContext("navbarId");
        }
        if (hasContext("root")) {
            root = getContext("root");
        }
        if (hasContext("onclick")) {
            onclick = getContext("onclick");
        }
    });

    function placeIs(targetPlaces, thisPlace) {
        if (typeof targetPlaces === "undefined" && thisPlace === "start") {
            return true;
        }
        if (Array.isArray(targetPlaces) && targetPlaces.includes(thisPlace)) {
            return true;
        } else if (
            typeof targetPlaces === "string" &&
            targetPlaces === thisPlace
        ) {
            return true;
        }
        return false;
    }
</script>

<UINavbarMenuWrapper {id} {active}>
    <UINavbarMenuStart>
        {#each items as item (item.id)}
            {#if placeIs(item.place, "start")}
                <UINavbarItemGeneric hidden="touch" {root} {item} {onclick}
                ></UINavbarItemGeneric>
            {/if}
        {/each}
    </UINavbarMenuStart>
    <UINavbarMenuEnd>
        {#each items as item, index (item.id)}
            {#if placeIs(item.place, "end")}
                <UINavbarItemGeneric
                    hidden="touch"
                    {root}
                    {item}
                    {onclick}
                    right={true}
                ></UINavbarItemGeneric>
            {/if}
        {/each}
    </UINavbarMenuEnd>
</UINavbarMenuWrapper>
