<script>
    import { run } from 'svelte/legacy';

    import UIButton from "./ui.button.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();





    /**
     * @typedef {Object} Props
     * @property {string} [title]
     * @property {boolean} [light]
     * @property {boolean} [loading]
     * @property {boolean} [raised]
     * @property {boolean} [outlined]
     * @property {boolean} [inverted]
     * @property {boolean} [rounded]
     * @property {boolean} [disabled]
     * @property {string} [state]
     * @property {string} [type]
     * @property {string} [color]
     * @property {string} [size]
     * @property {string} [classes]
     * @property {boolean} [icon]
     * @property {string} [iconSide]
     * @property {any} [uiOff]
     * @property {any} [uiOn]
     * @property {any} [action]
     * @property {any} value
     * @property {boolean} [selected]
     */

    /** @type {Props} */
    let {
        title = "",
        light = false,
        loading = false,
        raised = false,
        outlined = false,
        inverted = false,
        rounded = false,
        disabled = false,
        state = "",
        type = "",
        color = "",
        size = "",
        classes = "",
        icon = false,
        iconSide = "right",
        uiOff = () => {
            return {
                color: "",
            };
        },
        uiOn = () => {
            return {
                color: "success",
            };
        },
        action = () => {
            return !selected;
        },
        value,
        selected = $bindable(false)
    } = $props();

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

    let uiElement = $state();

    run(() => {
        if (uiElement) {
            selected ? uiElement.$set(uiOn()) : uiElement.$set(uiOff());
        }
    });
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
