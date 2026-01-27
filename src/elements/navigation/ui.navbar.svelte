<script>
    import { onMount, setContext } from "svelte";

    import UINavbarBrand from "./brand/ui.navbar.brand.svelte";
    import UINavbarBurger from "./ui.navbar.burger.svelte";

    import UINavbarMenu from "./menu/ui.navbar.menu.svelte";
    import UINavbarWrapper from "./ui.navbar.wrapper.svelte";

    let {
        id = "navbar",
        active = false,
        items = [],
        root = "",
        navigate = null,
        brand,
        burger,
        burgerControlsSidemenu = true,
        class: classes = "",
        onclick = () => {},
    } = $props();

    onMount(() => {
        setContext("root", root);
        setContext("navigate", navigate);
        setContext("burgerControlsSidemenu", burgerControlsSidemenu);
        setContext("navbarId", id);
        setContext("onclick", onclick);
    });

    function onBurgerClick() {
        active = !active;
    }
</script>

<UINavbarWrapper class={classes}>
    {#if brand}
        <UINavbarBrand {brand}
            ><UINavbarBurger {active} onclick={onBurgerClick}></UINavbarBurger>
        </UINavbarBrand>
    {:else}
        <UINavbarBurger {active} onclick={onBurgerClick}></UINavbarBurger>
    {/if}
    <UINavbarMenu {active} {items}></UINavbarMenu>
</UINavbarWrapper>
