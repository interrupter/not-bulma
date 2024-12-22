<script>
    import { onMount } from "svelte";

    import { LOCALE } from "../../locale";
    import notCommon from "../../frame/common";

    let sided = $state(false);

    /**
     * @typedef {Object} Props
     * @property {string} [id] - if we want to address this tag
     * @property {string} [title]
     * @property {string} [color]
     * @property {string} [size]
     * @property {string} [padding]
     * @property {boolean} [bold]
     * @property {boolean} [right]
     * @property {boolean} [left]
     * @property {boolean} [top]
     * @property {boolean} [bottom]
     * @property {string} [class]
     * @property {any} [events]
     * @property {any} [register] - register event handlers
     * @property {any} [onUpdate]
     * @property {any} [action]
     * @property {object} [vars]
     */

    /** @type {Props} */
    let {
        id = "tagId",
        title = $bindable("tag"),
        color = "info",
        size = "normal",
        padding = "normal",
        bold = false,
        right = false,
        left = false,
        top = false,
        bottom = false,
        class: classes = "",
        events = $bindable({}),
        register = notCommon.registerWidgetEvents.bind(notCommon),
        onUpdate = (data) => {
            if (Object.hasOwn(data, "title")) {
                title = data.title;
            }
        },
        action = () => {
            return true;
        },
        vars = {},
    } = $props();

    function getStandartUpdateEventName() {
        return `tag-${id}:update`;
    }

    let style = $state("");

    onMount(() => {
        if (!Object.hasOwn(events, getStandartUpdateEventName())) {
            events[getStandartUpdateEventName()] = onUpdate;
        }
        register(events);
        sided = right || left || top || bottom;
    });

    $effect(() => {
        style = Object.keys($state.snapshot(vars))
            .map((varName) => {
                return `${varName}: ${vars[varName]};`;
            })
            .join("");
    });
</script>

{#if title}
    <span
        role="button"
        tabindex="0"
        onkeydown={action ? action : undefined}
        onclick={action ? action : undefined}
        id="tag-{id}"
        class="
  tag
  {bold ? 'has-text-weight-bold' : ''}
  {padding !== 'normal' ? `is-padded-${padding}` : ''}
  is-{size}
  is-{color}
  {sided ? 'is-sided' : ''}
  {right ? 'is-sided-right' : ''}
  {left ? 'is-sided-left' : ''}
  {top ? 'is-sided-top' : ''}
  {bottom ? 'is-sided-bottom' : ''}
  {classes}"
        {style}>{$LOCALE[title]}</span
    >
{/if}
