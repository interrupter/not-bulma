<script>
    import { run } from "svelte/legacy";

    import { onMount } from "svelte";
    import notCommon from "../../frame/common";

    let sided = $state(false);

    /**
     * @typedef {Object} Props
     * @property {string} [id] - if we want to address this indicator
     * @property {string} [status]
     * @property {string} [size]
     * @property {any} [labels]
     * @property {string} [classes]
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
        status = $bindable("light"),
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
        classes = "mx-1",
        padding = "normal",
        bold = false,
        right = false,
        left = false,
        top = false,
        bottom = false,
        events = $bindable({}),
        register = notCommon.registerWidgetEvents.bind(notCommon),
        onUpdate = (data) => {
            if (Object.hasOwn(data, "status")) {
                status = data.status;
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
    run(() => {
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
  is-{status} {classes}
  ">{labels[status]}</span
>
