<script>
    import UITableCell from "./notTableCell.svelte";

    import { onMount } from "svelte";

    let itemId = $state();

    onMount(() => {
        itemId = getItemId(item);
    });

    /**
     * @typedef {Object} Props
     * @property {any} id
     * @property {any} [item]
     * @property {any} [helpers]
     * @property {any} [fields]
     * @property {boolean} [showSelect]
     * @property {any} [getItemId]
     */

    /** @type {Props} */
    let {
        id,
        item = {},
        helpers = {},
        fields = [],
        showSelect = false,
        isSelected = false,
        getItemId = () => {},
        onRowSelectChange = () => {},
    } = $props();

    function onRowSelect(e) {
        e.preventDefault();
        onRowSelectChange({
            id: itemId,
            selected: e.currentTraget.checked,
        });
        return false;
    }
</script>

<tr>
    {#if showSelect}
        <td>
            <input
                id="table-row-select-{getItemId(item)}"
                type="checkbox"
                data-id={getItemId(item)}
                checked={isSelected}
                placeholder=""
                name="row_selected_{getItemId(item)}"
                onchange={onRowSelect}
            />
        </td>
    {/if}
    {#each fields as field}
        <UITableCell {field} {helpers} {item} {getItemId} />
    {/each}
</tr>
