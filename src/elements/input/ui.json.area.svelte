<script>
    import UITextarea from "./ui.textarea.svelte";

    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable({}),
        fieldname = "jsonarea",
        valid = $bindable(true),

        class: classes = "",
        onchange = () => true,
        onerror = () => {},
        ...others
    } = $props();

    let _value = $state("{}");

    onMount(() => {
        try {
            _value = JSON.stringify(value, null, 4);
        } catch {
            _value = "{}";
        }
    });

    function onChange({ value: val }) {
        try {
            value = JSON.parse(val);
            valid = true;
            onchange({
                field: fieldname,
                value,
            });
        } catch (error) {
            onerror(error.message);
        }
        return true;
    }
</script>

<UITextarea bind:value={_value} onchange={onChange} {valid} {...others} />
