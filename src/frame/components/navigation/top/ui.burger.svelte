<script>
    const COMPONENT_NAME = "top-navbar-burger";

    import { createEventDispatcher, onMount } from "svelte";
    import SideMenuStore from "../side/store";

    const dispatch = createEventDispatcher();

    import notCommon from "../../../common";

    export let events = {};
    export let register = notCommon.registerWidgetEvents.bind(notCommon);

    export let closed = true;

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

    export let onUpdate = (data) => {
        closed = data.closed;
    };

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
    on:click={toggle}
    role="button"
    class="navbar-burger {closed ? '' : 'is-active'}"
    aria-label="menu"
    aria-expanded="false"
    data-target="navbar"
>
    <span aria-hidden="true" />
    <span aria-hidden="true" />
    <span aria-hidden="true" />
</a>
