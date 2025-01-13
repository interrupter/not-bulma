<script>
    import { onMount } from "svelte";

    import UIButton from "../button/ui.button.svelte";
    import UITag from "../various/ui.tag.svelte";

    let { button = {}, tag = {}, left, right, top, bottom } = $props();

    let vars = $state({});

    let tagPosition = {
        left: !!left,
        right: !!right,
        top: !!top,
        bottom: !!bottom,
    };

    onMount(() => {
        if (left) {
            vars[`--siding-left-size`] = left;
        }
        if (right) {
            vars["--siding-right-size"] = right;
        }
        if (top) {
            vars["--siding-top-size"] = top;
        }
        if (bottom) {
            vars["--siding-bottom-size"] = bottom;
        }
        vars = vars;
    });
</script>

<span class="is-tag-container">
    <UIButton {...button} />
    <UITag {...tag} {vars} {...tagPosition} />
</span>
