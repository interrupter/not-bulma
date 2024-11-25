<script>
    import UIButton from "./ui.button.svelte";

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
        state: activeState = "",
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
        onclick = () => {},
        onchange = () => {},
        value,
        selected = $bindable(false),
    } = $props();

    function onClick(event) {
        selected = action(event, value, selected);
        onclick({ value, selected });
        onChange();
    }

    function onChange() {
        onchange({
            value,
            selected,
        });
    }

    let uiElement = $state();

    $effect.pre(() => {
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
    state={activeState}
    {type}
    {color}
    {size}
    {classes}
    {icon}
    {iconSide}
    {value}
    onclick={onClick}
></UIButton>
