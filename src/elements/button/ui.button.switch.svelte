<script>
    import { onMount } from "svelte";
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
     * @property {string} [class]
     * @property {boolean} [icon]
     * @property {string} [iconSide]
     * @property {function} [uiOff]
     * @property {function} [uiOn]
     * @property {function} [action]
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
        class: classes = "",
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

    let childProps = $state({
        title,
        light,
        loading,
        raised,
        outlined,
        inverted,
        rounded,
        disabled,
        type,
        color,
        size,
        class: classes,
        icon,
        iconSide,
        value,
    });

    let uiElement = $state();

    onMount(() => {
        updateUI();
    });

    function onClick(event) {
        selected = action(event, value, selected);
        updateUI();
        onclick({ value, selected });
        onchange({
            value,
            selected,
        });
    }

    export function updateUI() {
        if (uiElement) {
            const propsChanges = selected
                ? uiOn(value, selected)
                : uiOff(value, selected);
            Object.keys(propsChanges).forEach((key) => {
                childProps[key] = propsChanges[key];
            });
            childProps = childProps;
        }
    }

    $effect(() => {
        if (typeof selected !== "undefined") updateUI();
    });
</script>

<UIButton
    bind:this={uiElement}
    {...childProps}
    state={activeState}
    onclick={onClick}
/>
