<script>
    import { onMount } from "svelte";

    import UIButtonSwitch from "./ui.button.switch.svelte";

    const uis = {};

    function updateItemUI(item) {
        uis[item.id].updateUI();
    }

    const defaultAction = (ev, value, selected) => {
        const countOfSelected = countSelected();
        if (countOfSelected === min && selected) {
            return selected;
        }
        if (countOfSelected === max && selected !== true) {
            return selected;
        }
        const indexOfCurrent = _values.findIndex((itm) => itm.value === value);
        let newSelected = selected;
        if (indexOfCurrent > -1) {
            newSelected = !newSelected;
            const cnt = countSelected() + (newSelected ? 1 : -1);
            if (min) {
                if (cnt < min) {
                    selectUpToMin(cnt, indexOfCurrent);
                }
            }
            if (max) {
                if (max < cnt) {
                    deselectDownToMin(cnt, indexOfCurrent);
                }
            }
            if (newSelected) {
                addToHistory(indexOfCurrent);
            }
            return newSelected;
        }
        return newSelected;
    };

    /**
     * @typedef {Object} Props
     * @property {array<object>} [values]
     * @property {boolean} [centered]
     * @property {boolean} [right]
     * @property {string} [class]
     * @property {import('svelte').Component}      [buttonComponent = UIButtonSwitch]
     * @property {object}   [buttonProps = {}]
     * @property {function} [action = (event, value, selected) => boolean]  fires on button switch click, returns new state of selected
     * @property {function} [onclick]
     * @property {function} [onchange]
     * @property {number} [min = 0]
     * @property {number} [max = 100]
     */

    /** @type {Props} */
    let {
        values = [],
        centered = false,
        right = false,
        class: classes = "",
        buttonComponent = UIButtonSwitch,
        buttonProps = {},
        action = defaultAction,
        onclick = () => true,
        onchange = () => true,
        min = 0,
        max = 100,
    } = $props();

    const selectHistory = [];
    let _values = $state(values);

    function onChange() {
        values = $state.snapshot(_values);
        const selected = values.filter((itm) => itm.selected);
        const selectedIds = selected.map((itm) => itm.id);
        const selectedCount = selectedIds.length;
        onchange &&
            onchange({
                values,
                selected,
                selectedIds,
                selectedCount,
            });
    }

    export function selectAll() {
        _values.forEach((itm, index) => {
            _values[index].selected = true;
            updateItemUI(itm);
        });
        onChange();
    }

    export function deselectAll() {
        _values.forEach((itm, index) => {
            _values[index].selected = false;
            updateItemUI(itm);
        });
        onChange();
    }

    onMount(() => {
        const selectedCount = countSelected();
        if (min && selectedCount < min) {
            selectUpToMin(selectedCount, -1);
        }
    });

    export function addToHistory(id) {
        if (selectHistory.includes(id)) {
            selectHistory.splice(selectHistory.indexOf(id), 1);
        }
        selectHistory.push(id);
    }

    export function countSelected() {
        const countOfSelected = _values.filter((btn) => {
            return btn.selected;
        }).length;
        return countOfSelected;
    }

    export function toggleFirstSuited(toValue) {
        const index = _values.findIndex((itm) => !toValue == itm.selected);
        if (index > -1) {
            _values[index].selected = toValue;
            updateItemUI(_values[index]);
            addToHistory(index);
        }
    }

    export function selectUpToMin(cnt, indexOfCurrent) {
        let delta = min - cnt;
        if (!delta) {
            return;
        }
        for (let t in _values) {
            if (t === indexOfCurrent) {
                continue;
            }
            if (!_values[t].selected) {
                _values[t].selected = true;
                updateItemUI(_values[t]);
                addToHistory(t);
                delta--;
                if (!delta) {
                    break;
                }
            }
        }
        onChange();
    }

    export function deselectDownToMin(cnt, indexOfCurrent) {
        let delta = cnt - max;
        if (!delta) {
            return;
        }
        for (let t in _values) {
            if (t === indexOfCurrent) {
                continue;
            }
            if (_values[t].selected) {
                _values[t].selected = false;
                updateItemUI(_values[t]);
                delta--;
                if (!delta) {
                    break;
                }
            }
        }
        onChange();
    }

    export function updateUI() {
        Object.keys(uis).forEach((itemId) => {
            if (uis[itemId]) {
                uis[itemId].updateUI && uis[itemId].updateUI();
            }
        });
    }
</script>

<div
    class="buttons has-addons {centered ? 'is-centered' : ''} {right
        ? 'is-right'
        : ''} {classes}"
>
    {#each _values as item, index (item.id)}
        {@const SvelteComponent = buttonComponent}
        <SvelteComponent
            bind:this={uis[item.id]}
            {action}
            {...item}
            {...buttonProps}
            {onclick}
            bind:selected={_values[index].selected}
            onchange={onChange}
        />
    {/each}
</div>
