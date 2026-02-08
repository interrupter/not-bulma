<script>
    import "bulma-switch";

    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {boolean} [value]
     * @property {string} [fieldname]
     * @property {boolean} [disabled]
     * @property {boolean} [readonly]
     * @property {string} [styling]
     */

    /** @type {Props} */
    let {
        id = "",
        value = $bindable(false),
        fieldname = "switch",
        disabled = false,
        readonly = false,
        styling = " is-rounded is-success ",
        onchange = () => {},
    } = $props();

    function onInput(ev) {
        let data = {
            id,
            field: fieldname,
            value:
                ev.target.type === "checkbox"
                    ? ev.target.checked
                    : ev.target.value,
        };
        onchange(data);
        return true;
    }
</script>

<input
    type="checkbox"
    class="switch {styling}"
    id="edit-table-row-cell-inline-switch-{fieldname}-{id}"
    bind:checked={value}
    name={fieldname}
    {readonly}
    {disabled}
    oninput={onInput}
/>
<label class="label" for="edit-table-row-cell-inline-switch-{fieldname}-{id}"
></label>
