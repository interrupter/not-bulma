<script>
    import { LOCALE } from "../../../locale";

    import * as Stores from "./stores.js";

    import UITableRow from "./notTableRow.svelte";

    import { UILinks } from "../../../elements/link";
    import { UIButtons } from "../../../elements/button";
    import UIIcon from "../../../elements/icon/ui.icon.font.svelte";

    import { onMount, createEventDispatcher } from "svelte";
    let dispatch = createEventDispatcher();

    export let id;

    export let filterUI;

    export let helpers = {};
    export let state = {};
    export let filter = {};
    export let sorter = {};
    export let fields = [];
    export let selected = {};
    export let items = [];
    export let actions = [];
    export let links = [];
    export let search = "";
    export let showSearch = true;
    export let showSelect = true;
    export let selectAll = false;

    export let getItemId = (item) => item._id;

    onMount(() => {
        if (showSelect) {
            Stores.get(id).selected.subscribe((value) => {
                selected = value;
            });
        }
        Stores.get(id).refined.subscribe((value) => {
            items = value;
            if (showSelect) {
                for (let itemId in selected) {
                    if (!items.some((item) => getItemId(item) === itemId)) {
                        delete selected[itemId];
                    } else {
                        if (!Object.hasOwn(selected, itemId)) {
                            selected[itemId] = false;
                        }
                    }
                }
                selected = selected;
            }
        });
        Stores.get(id).state.subscribe((value) => {
            state = value;
        });
    });

    function onSearchInput(ev) {
        try {
            let data = ev.currentTarget.value.trim();
            dispatch("searchChange", data);
        } catch (e) {
            return;
        }
    }

    function onSearchChange({ detail }) {
        try {
            dispatch("searchChange", detail);
        } catch (e) {
            return;
        }
    }

    function onFilterChange({ detail }) {
        try {
            dispatch("filterChange", detail);
        } catch (e) {
            return;
        }
    }

    function goPrev() {
        dispatch("goToPrevPage");
    }

    function goNext() {
        dispatch("goToNextPage");
    }

    function goTo(e) {
        e.preventDefault();
        let el = e.target;
        dispatch("goToPage", parseInt(el.dataset.page));
        return false;
    }

    function onSelectAll() {
        Stores.get(id).selected.update((value) => {
            items.forEach((item) => {
                value[getItemId(item)] = selectAll;
            });
            return value;
        });
    }

    function onFieldHeadClick(field) {
        const propPath = field.path.substring(1);
        if (Object.hasOwn(sorter, propPath)) {
            sorter[propPath] = parseInt(sorter[propPath]) * -1;
        } else {
            sorter = {
                [propPath]: 1,
            };
        }
        dispatch("sorterChange", sorter);
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
        <svelte:component
            this={filterUI}
            bind:filter
            on:change={onFilterChange}
            on:searchChange={onSearchChange}
        />
    {:else}
        <div class="field">
            <div class="control">
                <input
                    class="input"
                    type="text"
                    placeholder="Поиск"
                    bind:value={search}
                    on:input={onSearchInput}
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
                    on:change={onSelectAll}
                /></th
            >
        {/if}
        {#each fields as field}
            {@const propPath = field.path.substring(1)}
            <th
                class={(field.hideOnMobile ? " is-hidden-touch" : "") +
                    (field.sortable ? " is-clickable" : "")}
                on:click={onFieldHeadClick(field)}
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
                {getItemId}
                on:rowSelectChange
            />
        {/each}
    </tbody>
</table>
{#if state?.pagination?.pages?.list.length > 1}
    <nav class="pagination is-centered" aria-label="pagination">
        <a href class="pagination-previous" on:click={goPrev}>Назад</a>
        <a href class="pagination-next" on:click={goNext}>Вперед</a>
        <ul class="pagination-list">
            {#if state.pagination && state.pagination.pages && state.pagination.pages.list}
                {#each state.pagination.pages.list as page}
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
                                on:click={goTo}>{page.index + 1}</a
                            >
                        {/if}
                    </li>
                {/each}
            {/if}
        </ul>
    </nav>
{/if}
