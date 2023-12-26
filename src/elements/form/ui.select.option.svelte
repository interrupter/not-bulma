<script>
    import { LOCALE } from "../../locale";
    export let value;
    export let title;
    export let selected;
</script>

<option {value} {selected}>{$LOCALE[title]}</option>