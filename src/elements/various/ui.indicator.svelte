<script>
    import { onMount } from "svelte";
    import notCommon from "../../frame/common";

    /**
     * @typedef {Object} Props
     * @property {string}   [id = "tagId"] - if we want to address this indicator
     * @property {string}   [state = "light"]
     * @property {string}   [size = "normal"]
     * @property {any}      [labels = {black, dark, light, white, primary, link, info, success, warning, danger}]
     * @property {string}   [class = "max-1"]
     * @property {string}   [padding = "normal"]
     * @property {boolean}  [bold = false]
     * @property {boolean}  [right = false]
     * @property {boolean}  [left = left]
     * @property {boolean}  [top = false]
     * @property {boolean}  [bottom = false]
     * @property {any}      [events = {}]
     * @property {any}      [register = notCommon.registerWidgetEvents] - register event handlers
     * @property {any}      [onUpdate = (data) => currentState = data.state]
     */

    /** @type {Props} */
    let {
        id = "tagId",
        state: currentState = $bindable("light"),
        size = "normal",
        labels = {
            black: "black",
            dark: "dark",
            light: "light",
            white: "white",
            primary: "primary",
            link: "link",
            info: "info",
            success: "success",
            warning: "warning",
            danger: "danger",
        },
        class: classes = "mx-1",
        padding = "normal",
        bold = false,
        right = false,
        left = false,
        top = false,
        bottom = false,
        events = $bindable({}),
        register = notCommon.registerWidgetEvents.bind(notCommon),
        onUpdate = (data) => {
            if (Object.hasOwn(data, "state")) {
                currentState = data.state;
            }
        },
    } = $props();

    function getStandartUpdateEventName() {
        return `indicator-${id}:update`;
    }

    onMount(() => {
        if (!Object.hasOwn(events, getStandartUpdateEventName())) {
            events[getStandartUpdateEventName()] = onUpdate;
        }
        register(events);
    });

    let sided = $derived(right || left || top || bottom);
</script>

<span
    class="tag is-{size} {padding && padding !== 'normal'
        ? `is-padded-${padding}`
        : ''} is-{currentState} {classes}"
    class:has-text-weight-bold={bold}
    class:is-sided={sided}
    class:is-sided-right={right}
    class:is-sided-left={left}
    class:is-sided-top={top}
    class:is-sided-bottom={bottom}>{labels[currentState]}</span
>
