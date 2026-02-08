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
        url,
    } = $props();

    setContext("root", root);
    setContext("navigate", navigate);
    setContext("burgerControlsSidemenu", burgerControlsSidemenu);
    setContext("navbarId", id);
    setContext("onclick", onclick);

    onMount(() => {});

    function onBurgerClick() {
        active = !active;
    }
</script>

<UINavbarWrapper class={classes}>
    {#if brand}
        <UINavbarBrand {brand}>
            {#if burger}
                <UINavbarBurger {active} onclick={onBurgerClick}
                ></UINavbarBurger>
            {/if}
        </UINavbarBrand>
    {:else if burger}
        <UINavbarBurger {active} onclick={onBurgerClick}></UINavbarBurger>
    {/if}
    <UINavbarMenu {active} {items} {url}></UINavbarMenu>
</UINavbarWrapper>
