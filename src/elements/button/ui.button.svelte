<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    import { LOCALE } from "../../locale";

    export let title = "";
    export let light = false;
    export let loading = false;
    export let raised = false;
    export let outlined = false;
    export let inverted = false;
    export let rounded = false;
    export let disabled = false;
    export let state = "";
    export let type = "";
    export let color = "";
    export let size = "";
    export let classes = "";
    export let icon = false;
    export let iconSide = "right";
    export let action = () => {
        return true;
    };
    export let value;

    function onClick(event) {
        event.stopPropagation();
        dispatch("click", { event, value });
        return action(event, value);
    }
</script>

<button
    on:click={onClick}
    {disabled}
    type={type ? type : ""}
    class="
  button
  {classes}
  {state ? `is-${state}` : ''}
  {inverted ? `is-inverted` : ''}
  {outlined ? `is-outlined` : ''}
  {raised ? `is-raised` : ''}
  {rounded ? `is-rounded` : ''}
  {light ? `is-light` : ''}
  {loading ? `is-loading` : ''}
  {color ? `is-${color}` : ''}
  {size ? `is-${size}` : ''}
  "
>
    <slot>
        {#if icon}
            {#if iconSide === "left"}
                <span class="icon"
                    ><i
                        class="fas fa-{icon} {size ? `is-${size}` : ''}"
                    /></span
                >
            {/if}
            {#if title}
                <span>{$LOCALE[title]}</span>
            {/if}
            {#if iconSide === "right"}
                <span class="icon"
                    ><i
                        class="fas fa-{icon} {size ? `is-${size}` : ''}"
                    /></span
                >
            {/if}
        {:else}
            {$LOCALE[title]}
        {/if}
    </slot>
</button>
