<script>
    const CLASS_ICON = {
        OPENED: "fa-angle-down",
        CLOSED: "fa-angle-up",
    };

    /**
     * @typedef {Object} Props
     * @property {any} [icon_opened]
     * @property {any} [icon_closed]
     * @property {boolean} [closed]    returns if we should apply toggle or if false - reject it and toggle backward
     */

    /** @type {Props} */
    let {
        icon_opened = CLASS_ICON.OPENED,
        icon_closed = CLASS_ICON.CLOSED,
        closed,
        ontoggle = () => {
            return true;
        },
    } = $props();

    function onClick(e) {
        e && e.preventDefault() && e.stopPropagation();
        closed = !closed;
        if (!ontoggle(closed)) {
            closed = !closed;
        }
        return false;
    }
</script>

<span
    class="icon is-small is-toggle-submenu is-pulled-right"
    onclick={onClick}
    onkeyup={onClick}
    role="button"
    tabindex="0"
>
    <i class="fas {closed ? icon_closed : icon_opened}" aria-hidden="true"></i>
</span>
