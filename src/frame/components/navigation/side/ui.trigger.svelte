<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    const CLASS_ICON = {
        OPENED: "fa-angle-down",
        CLOSED: "fa-angle-up",
    };


    /**
     * @typedef {Object} Props
     * @property {any} [icon_opened]
     * @property {any} [icon_closed]
     * @property {boolean} [closed]
     */

    /** @type {Props} */
    let { icon_opened = CLASS_ICON.OPENED, icon_closed = CLASS_ICON.CLOSED, closed = $bindable(false) } = $props();

    function onClick(e) {
        e && e.preventDefault() && e.stopPropagation();
        closed = !closed;
        dispatch("toggle", { closed });
        return false;
    }
</script>

<span
    class="icon is-small is-toggle-submenu is-pulled-right"
    onclick={onClick}
    onkeyup={onClick}
>
    <i class="fas {closed ? icon_closed : icon_opened}" aria-hidden="true"></i>
</span>
