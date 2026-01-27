<script>
    import UINavbarMenuPart from "./ui.navbar.menu.part.svelte";
    let { ...other } = $props();
</script>

<UINavbarMenuPart {...other} classPrefix="navbar-end"></UINavbarMenuPart>
