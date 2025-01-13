<script>
    import { onMount } from "svelte";

    import { LOCALE } from "../../locale";
    import notCommon from "../../frame/common";

    /**
     * @typedef {Object} Props
     * @property {string}   [id = "tagId"]                                  if we want to address this tag, as tag-{id}:{eventName}, ex. tag-tagId:update
     * @property {string}   [title = "tag"]                                 tag title
     * @property {string}   [color = "info"]                                bulma color
     * @property {string}   [size = "normal"]                               bulma size
     * @property {string}   [padding = "normal"]                            size of left/right paddings (small = 0.5em, normal = 1em, big = 1.5em, large = 2em), class names is is-padded-{padding}
     * @property {boolean}  [bold = false]                                  title styling
     * @property {boolean}  [right = false]                                 tag positioning on the right
     * @property {boolean}  [left = false]                                  tag positioning on the left
     * @property {boolean}  [top = false]                                   tag positioning on the top
     * @property {boolean}  [bottom = false]                                tag positioning on the bottom
     * @property {string}   [class  = ""]                                   additional css classes list
     * @property {object}   [events = {}]                                   list of events {name:callback}
     * @property {function} [register = notCommon.registerWidgetEvents]     register event handlers
     * @property {function} [onUpdate = (data) => title = data.title;]
     * @property {function} [action]                                        onclick/onkeydown callback
     * @property {object}   [vars = {}]                                     css vars list
     */

    /** @type {Props} */
    let {
        id = "tagId",
        title = "tag",
        color = "info",
        size = "normal",
        padding = "normal",
        bold = false,
        right = false,
        left = false,
        top = false,
        bottom = false,
        class: classes = "",
        events = {},
        register = notCommon.registerWidgetEvents.bind(notCommon),
        onUpdate = (data) => {
            if (Object.hasOwn(data, "title")) {
                title = data.title;
            }
        },
        action,
        vars = {},
        role = "button",
        tabIndex = "0",
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
    });

    let sided = $derived(right || left || top || bottom);

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
        {role}
        {tabIndex}
        onkeydown={action ? action : undefined}
        onclick={action ? action : undefined}
        id="tag-{id}"
        class="
  tag
  {padding !== 'normal' ? `is-padded-${padding}` : ''}
  is-{size}
  is-{color}  
  {classes}"
        class:is-clickable={action}
        class:has-text-weight-bold={bold}
        class:is-sided={sided}
        class:is-sided-right={right}
        class:is-sided-left={left}
        class:is-sided-top={top}
        class:is-sided-bottom={bottom}
        {style}>{$LOCALE[title]}</span
    >
{/if}
