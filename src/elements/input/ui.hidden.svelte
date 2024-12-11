<script>
    /** @type {import('./type').UIInputProps} */
    let {
        value = $bindable(""),
        fieldname = "hidden",
        required = true,
        readonly = false,
        ...others
    } = $props();
</script>

<input
    id="form-field-hidden-{fieldname}"
    type="hidden"
    bind:value
    {required}
    {readonly}
    name={fieldname}
    {others}
/>
