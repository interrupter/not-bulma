<script>
    import { onMount } from "svelte";
    import UIButton from "../button/ui.button.svelte";

    /**
     * @typedef {Object} Props
     * @property {any} [trigger] - export let direction = 'left';  //left/right/top/bottom/around
     */

    /** @type {Props} */
    let {
        trigger = {
            title: "Click me!",
            icon: "plus",
            color: "primary",
            size: "medium",
            onclick: () => true,
        },
        top = "2em",
        left = "2em",
        right,
        bottom,
        class: classes = "",
    } = $props();

    let positionStyle = $state("");

    onMount(() => {
        positionStyle = "";
        if (top) {
            positionStyle += `top: ${top};`;
        }
        if (left) {
            positionStyle += `left: ${left};`;
        }
        if (right) {
            positionStyle += `right: ${right};`;
        }
        if (bottom) {
            positionStyle += `bottom: ${bottom};`;
        }
    });
</script>

<div class="is-absolute {classes}" style={positionStyle}>
    <UIButton {...trigger} />
</div>
