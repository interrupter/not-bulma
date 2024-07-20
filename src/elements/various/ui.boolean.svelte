<script>
    import UITag from "./ui.tag.svelte";

    export let LC_TRUE = "not-node:booleans_true";
    export let LC_FALSE = "not-node:booleans_false";

    export let value;
    export let inverted = false;

    const FALSE_VALUE = {
        title: LC_FALSE,
        color: "danger",
    };
    const TRUE_VALUE = {
        title: LC_TRUE,
        color: "success",
    };

    const variants = [FALSE_VALUE, TRUE_VALUE];

    $: tagValue = value
        ? variants.at(1 + (inverted ? 1 : 0))
        : variants.at(0 + (inverted ? 1 : 0));
</script>

<UITag {...tagValue} />
