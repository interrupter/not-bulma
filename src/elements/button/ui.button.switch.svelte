<script>
    import UIButton from "./ui.button.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

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

    export let uiOff = () => {
        return {
            color: "",
        };
    };

    export let uiOn = () => {
        return {
            color: "success",
        };
    };

    export let action = () => {
        return !selected;
    };

    export let value;
    export let selected = false;

    function onClick(event) {
        selected = action(event, value, selected);
        dispatch("click", { value, selected });
        onChange();
    }

    function onChange() {
        dispatch("change", {
            value,
            selected,
        });
    }

    let uiElement;

    $: {
        if (uiElement) {
            selected ? uiElement.$set(uiOn()) : uiElement.$set(uiOff());
        }
    }
</script>

<UIButton
    bind:this={uiElement}
    {title}
    {light}
    {loading}
    {raised}
    {outlined}
    {inverted}
    {rounded}
    {disabled}
    {state}
    {type}
    {color}
    {size}
    {classes}
    {icon}
    {iconSide}
    {value}
    on:click={onClick}
></UIButton>
