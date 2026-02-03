import { writable } from "svelte/store";

const SideMenuState = writable({
    open: true
});

export default SideMenuState;