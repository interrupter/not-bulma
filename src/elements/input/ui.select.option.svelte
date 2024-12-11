<script>
    import { LOCALE } from "../../locale";
    let { value, title, selected } = $props();
</script>

<option {value} {selected}>{$LOCALE[title]}</option>