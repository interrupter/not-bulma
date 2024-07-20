<script>
    import UITag from "./ui.tag.svelte";

    export let LC_TRUE = "not-node:booleans_true";
    export let LC_FALSE = "not-node:booleans_false";

    export let value;
    export let inverted = false;

    const FALSE_VALUE = {
        title: LC_FALSE,
        color: inverted ? "success" : "danger",
    };

    const TRUE_VALUE = {
        title: LC_TRUE,
        color: inverted ? "danger" : "success",
    };

    //if inverted === true, inverts value
    $: tagValue = value ? TRUE_VALUE : FALSE_VALUE;
</script>

<UITag {...tagValue} />
