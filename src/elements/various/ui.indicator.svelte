<script>
    import { onMount } from "svelte";
    import notCommon from "../../frame/common";

    let sided = $state(false);

    /**
     * @typedef {Object} Props
     * @property {string} [id] - if we want to address this indicator
     * @property {string} [state]
     * @property {string} [size]
     * @property {any} [labels]
     * @property {string} [class]
     * @property {string} [padding]
     * @property {boolean} [bold]
     * @property {boolean} [right]
     * @property {boolean} [left]
     * @property {boolean} [top]
     * @property {boolean} [bottom]
     * @property {any} [events]
     * @property {any} [register] - register event handlers
     * @property {any} [onUpdate]
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

    $effect(() => {
        sided = right || left || top || bottom;
    });
</script>

<span
    class="tag
is-{size}
{bold ? 'has-text-weight-bold' : ''}
{padding !== 'normal' ? `is-padded-${padding}` : ''}
{sided ? 'is-sided' : ''}
{right ? 'is-sided-right' : ''}
{left ? 'is-sided-left' : ''}
{top ? 'is-sided-top' : ''}
{bottom ? 'is-sided-bottom' : ''}
  is-{currentState} {classes}
  ">{labels[currentState]}</span
>
