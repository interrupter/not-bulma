<script>
    import { onMount } from "svelte";

    import UIButton from "../button/ui.button.svelte";
    import UITag from "../various/ui.tag.svelte";

    let { button = {}, tag = {}, left, right, top, bottom } = $props();

    let siding = $state("");
    let vars = $state({});

    function addVerticalCenteringIfNeeded() {
        if (!bottom && !top) {
            siding += ` is-vertical-centered`;
        }
    }

    function addHorizontalCenteringIfNeeded() {
        if (!right && !left) {
            siding += ` is-horizontal-centered`;
        }
    }

    onMount(() => {
        if (left) {
            siding += ` is-sided-left`;
            vars[`--siding-left-size`] = left;
            addVerticalCenteringIfNeeded();
        }
        if (right) {
            siding += ` is-sided-right`;
            vars["--siding-right-size"] = right;
            addVerticalCenteringIfNeeded();
        }
        if (top) {
            siding += ` is-sided-top`;
            vars["--siding-top-size"] = top;
            addHorizontalCenteringIfNeeded();
        }
        if (bottom) {
            siding += ` is-sided-bottom`;
            vars["--siding-bottom-size"] = bottom;
            addHorizontalCenteringIfNeeded();
        }
        vars = vars;
    });
</script>

<span
    class="is-relative"
    style="display: inline-block; width: fit-content; height: fit-content; "
>
    <UIButton {...button} />
    <UITag {...tag} class="is-padded-small is-sided {siding}" {vars} />
</span>
