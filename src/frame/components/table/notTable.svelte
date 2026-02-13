<script>
    import { LOCALE } from "../../../locale";

    import UITableRow from "./notTableRow.svelte";

    import { UILinks } from "../../../elements/link";
    import { UIButtons } from "../../../elements/button";
    import UIIcon from "../../../elements/icon/ui.icon.font.svelte";

    /**
     * @typedef {Object} Props
     * @property {any} id
     * @property {any} filterUI
     * @property {any} [helpers]
     * @property {any} [state]
     * @property {any} [filter]
     * @property {any} [sorter]
     * @property {any} [fields]
     * @property {any} [selected]
     * @property {any} [items]
     * @property {any} [actions]
     * @property {any} [links]
     * @property {string} [search]
     * @property {boolean} [showSearch]
     * @property {boolean} [showSelect]
     * @property {boolean} [selectAll]
     * @property {any} [getItemId]
     */

    /** @type {Props} */
    let {
        id,
        filterUI,
        helpers = {},
        //navigation
        filter = {},
        sorter = {},
        fields = [],
        //table data
        selected = {},
        items = [],
        state = {},
        //buttons & links
        actions = [],
        links = [],
        //
        search = "",
        showSearch = true,
        showSelect = true,
        selectAll = false,
        getItemId = (item) => item._id,
        //event handlers
        onRowSelectChange = () => {},
        onRowCellChange = () => {},
        onSelectAll = () => {},
        onSelectNone = () => {},
        onSearchChange = () => {},
        onFilterChange = () => {},
        onSorterChange = () => {},
        onGoToPage = () => {},
        onGoToPrevPage = () => {},
        onGoToNextPage = () => {},
    } = $props();

    function _onSearchInput(ev) {
        try {
            let data = ev.currentTarget.value.trim();
            onSearchChange(data);
        } catch (e) {
            return;
        }
    }

    function _onSearchChange({ detail }) {
        try {
            onSearchChange(detail);
        } catch (e) {
            return;
        }
    }

    function _onFilterChange({ detail }) {
        try {
            onFilterChange(detail);
        } catch (e) {
            return;
        }
    }

    function _goTo(e) {
        e.preventDefault();
        let el = e.target;
        onGoToPage(parseInt(el.dataset.page));
        return false;
    }

    function _onSelectAllToggle() {
        items.forEach((item) => {
            selected[getItemId(item)] = selectAll;
        });
        if (selectAll) {
            onSelectAll(selected);
        } else {
            onSelectNone(selected);
        }
    }

    function _onFieldHeadClick(field) {
        const propPath = field.path.substring(1);
        if (Object.hasOwn(sorter, propPath)) {
            sorter[propPath] = parseInt(sorter[propPath]) * -1;
        } else {
            sorter = {
                [propPath]: 1,
            };
        }
        onSorterChange(sorter);
    }

    function _onRowSelectChange(event) {
        selected[event.id] = event.selected;
        onRowSelectChange(event);
    }
</script>

{#if links.length}
    <div class="field is-grouped">
        <UILinks values={links} />
    </div>
{/if}
{#if actions.length}
    <div class="field is-grouped">
        <UIButtons values={actions} />
    </div>
{/if}
{#if showSearch}
    {#if filterUI}
        {@const SvelteComponent = filterUI}
        <SvelteComponent
            {filter}
            onchange={_onFilterChange}
            onSearchChange={_onSearchChange}
        />
    {:else}
        <div class="field">
            <div class="control">
                <input
                    class="input"
                    type="text"
                    placeholder="Поиск"
                    value={search}
                    oninput={_onSearchInput}
                />
            </div>
        </div>
    {/if}
{/if}
<table class="table">
    <thead>
        {#if showSelect}
            <th
                ><input
                    type="checkbox"
                    id="table-row-select-page"
                    bind:checked={selectAll}
                    placeholder=""
                    name="row_selected_all"
                    onchange={_onSelectAllToggle}
                /></th
            >
        {/if}
        {#each fields as field}
            {@const propPath = field.path.substring(1)}
            <th
                class={(field.hideOnMobile ? " is-hidden-touch" : "") +
                    (field.sortable ? " is-clickable" : "")}
                onclick={() => _onFieldHeadClick(field)}
            >
                {#if field.sortable && Object.hasOwn(sorter, propPath)}
                    <UIIcon
                        font={sorter[propPath] > 0 ? "sort-up" : "sort-down"}
                        title={field.title}
                        pointable={true}
                    />
                {:else}
                    {$LOCALE[field.title]}
                {/if}
            </th>
        {/each}
    </thead>
    <tbody>
        {#each items as item (item._id)}
            <UITableRow
                {id}
                {item}
                {fields}
                {helpers}
                {showSelect}
                isSelected={selected[getItemId(item)]}
                {getItemId}
                onRowSelectChange={_onRowSelectChange}
                onchange={onRowCellChange}
            />
        {/each}
    </tbody>
</table>
{#if state?.pagination?.pages?.list.length >= 1}
    <nav class="pagination is-centered" aria-label="pagination">
        {#if state?.pagination?.pages?.current > 0}
            <a href class="pagination-previous" onclick={onGoToPrevPage}
                >Назад</a
            >
        {/if}
        {#if state?.pagination?.pages?.current < state?.pagination?.pages.to}
            <a href class="pagination-next" onclick={onGoToNextPage}>Вперед</a>
        {/if}
        <ul class="pagination-list">
            {#if state && state?.pagination && state?.pagination.pages && state?.pagination.pages.list}
                {#each state?.pagination.pages.list as page}
                    <li>
                        {#if page.active}
                            <a
                                href
                                class="pagination-link is-current"
                                aria-label="Страница {page.index}"
                                aria-current="page">{page.index + 1}</a
                            >
                        {:else}
                            <a
                                href
                                class="pagination-link"
                                aria-label="Страница {page.index}"
                                data-page={page.index}
                                onclick={_goTo}>{page.index + 1}</a
                            >
                        {/if}
                    </li>
                {/each}
            {/if}
        </ul>
    </nav>
{/if}
