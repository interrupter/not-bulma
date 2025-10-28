<script>
    import NavbarWrapper from "./navbar/navbar.wrapper.svelte";
    import NavbarBrandWrapper from "./navbar/navbar.brand.wrapper.svelte";
    import NavbarBrandItem from "./navbar/navbar.brand.item.svelte";

    import NavbarMenu from "./navbar/navbar.menu.svelte";
    import NavbarMenuStart from "./navbar/navbar.menu.start.svelte";
    import NavbarMenuEnd from "./navbar/navbar.menu.end.svelte";

    import NavbarItem from "./navbar/navbar.item.svelte";
    import NavbarSection from "./navbar/navbar.section.svelte";

    let {
        id = "",
        active = true,
        sections = [],
        items = [],
        root = "",
        navigate = null,
        brand = false,
        burger = true,
        burgerControlsSidemenu = true,
        class: classes = "",
        onClick = () => {},
    } = $props();
</script>

<NavbarWrapper class={classes}>
    {#if brand}
        <NavbarBrandWrapper>
            <NavbarBrandItem {...brand}></NavbarBrandItem>
        </NavbarBrandWrapper>
    {/if}
    <NavbarMenu {id} {active}>
        <NavbarMenuStart>
            {#each items as item (item.id)}
                {#if item.place === "start"}
                    <NavbarItem hidden="touch" {item} onclick={onClick}
                    ></NavbarItem>
                {/if}
            {/each}
        </NavbarMenuStart>
        <NavbarMenuEnd>
            {#each sections as section (section.id)}
                {@const sectionIsNotEmpty =
                    sectionsItemsCount[section.id] ||
                    section.indicator ||
                    section.tag}
                {#if sectionIsNotEmpty && section.place === "end"}
                    <NavbarSection
                        right={true}
                        hidden={section.hidden}
                        {root}
                        {section}
                        items={sectionsItems[section.id]}
                        onclick={onClick}
                    />
                {/if}
            {/each}
        </NavbarMenuEnd>
    </NavbarMenu>
</NavbarWrapper>
