<script>
    import { LOCALE } from "../../locale";
    export let title = "";
    export let url = "";
    export let target = "blank";
    export let light = false;
    export let loading = false;
    export let raised = false;
    export let outlined = false;
    export let inverted = false;
    export let rounded = false;
    export let state = "";
    export let type = "";
    export let color = "";
    export let size = "";
    export let classes = "button ";
    export let icon = false;
    export let iconSide = "right";
    export let action = () => {
        return true;
    };

    $: {
        classes =
            (state && state.length > 0 ? ` is-${state} ` : "") +
            (light ? ` is-light ` : "") +
            (type && type.length > 0 ? ` is-${type} ` : "") +
            (size && size.length > 0 ? ` is-${size} ` : "");
    }
</script>

<a
    on:click={action}
    target="_{target}"
    href={url}
    class="{classes} {state ? `is-${state}` : ''} {inverted
        ? `is-inverted`
        : ''} {outlined ? `is-outlined` : ''} {raised
        ? `is-raised`
        : ''} {rounded ? `is-rounded` : ''} {light ? `is-light` : ''} {loading
        ? `is-loading`
        : ''} {color ? `is-${color}` : ''} {type ? `is-${type}` : ''} {size
        ? `is-${size}`
        : ''}"
>
    {#if icon}
        {#if iconSide === "left"}
            <span class="icon"
                ><i class="fas fa-{icon} {size ? `is-${size}` : ''}" /></span
            >
        {/if}
        {#if title}
            <span>{$LOCALE[title]}</span>
        {/if}
        <slot />
        {#if iconSide === "right"}
            <span class="icon"
                ><i class="fas fa-{icon} {size ? `is-${size}` : ''}" /></span
            >
        {/if}
    {:else}
        {$LOCALE[title]}
        <slot />
    {/if}
</a>
