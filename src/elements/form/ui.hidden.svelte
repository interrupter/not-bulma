<script>
    /**
     * @typedef {Object} Props
     * @property {string} [value]
     * @property {string} [fieldname]
     * @property {boolean} [required]
     * @property {boolean} [readonly]
     */

    /** @type {Props} */
    let {
        value = $bindable(""),
        fieldname = "hidden",
        required = true,
        readonly = false
    } = $props();
</script>

<input type="hidden" bind:value {required} {readonly} name={fieldname} />
