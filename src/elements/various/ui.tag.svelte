<script>
  import { run } from 'svelte/legacy';

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
   * @property {string} [classes]
   * @property {any} [events]
   * @property {any} [register] - register event handlers
   * @property {any} [onUpdate]
   * @property {any} [action]
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
      classes = "",
      events = $bindable({}),
      register = notCommon.registerWidgetEvents.bind(notCommon),
      onUpdate = (data) => {
          if (Object.hasOwn(data, "title")) {
              title = data.title;
          }
      },
      action = () => {
          return true;
      }
  } = $props();

    function getStandartUpdateEventName() {
        return `tag-${id}:update`;
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

{#if title}
    <span
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
  {classes}">{$LOCALE[title]}</span
    >
{/if}
