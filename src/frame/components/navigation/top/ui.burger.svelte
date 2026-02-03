<script>
    const COMPONENT_NAME = "top-navbar-burger";

    import { createEventDispatcher, onMount } from "svelte";
    import SideMenuStore from "../side/store";

    const dispatch = createEventDispatcher();

    import notCommon from "../../../common";



    function toggle(e) {
        e.preventDefault();
        closed = !closed;
        dispatch("toggle", {
            closed,
        });
        return false;
    }

    function getStandartUpdateEventName() {
        return COMPONENT_NAME + ":update";
    }

    /**
     * @typedef {Object} Props
     * @property {any} [events]
     * @property {any} [register]
     * @property {boolean} [closed]
     * @property {any} [onUpdate]
     */

    /** @type {Props} */
    let {
        events = $bindable({}),
        register = notCommon.registerWidgetEvents.bind(notCommon),
        closed = $bindable(true),
        onUpdate = (data) => {
        closed = data.closed;
    }
    } = $props();

    onMount(() => {
        if (!notCommon.objHas(events, getStandartUpdateEventName())) {
            events[getStandartUpdateEventName()] = onUpdate;
        }
        register(events);
    });

    SideMenuStore.subscribe((val) => {
        closed = !val.open;
        return val;
    });
</script>

<a
    href
    onclick={toggle}
    role="button"
    class="navbar-burger {closed ? '' : 'is-active'}"
    aria-label="menu"
    aria-expanded="false"
    data-target="navbar"
>
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
    <span aria-hidden="true"></span>
</a>
