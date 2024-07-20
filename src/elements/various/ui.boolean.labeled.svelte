<script>
    import { LOCALE } from "../../locale";
    import UIBoolean from "./ui.boolean.svelte";

    export let value;
    export let label;
    export let inverted = false;
</script>

<span class="label">{$LOCALE[label]}: <UIBoolean {value} {inverted} /></span>
