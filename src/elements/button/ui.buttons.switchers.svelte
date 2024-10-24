<script>
    import { createEventDispatcher, onMount } from "svelte";
    const dispatch = createEventDispatcher();
    import UIButtonSwitch from "./ui.button.switch.svelte";


    const selectHistory = [];

    export function selectAll() {
        values.forEach((itm) => {
            itm.selected = true;
        });
        values = values;
    }

    export function deselectAll() {
        values.forEach((itm) => {
            itm.selected = false;
        });
        values = values;
    }

    onMount(() => {
        if (min) {
            selectUpToMin(0, -1);
        }
    });

    function addToHistory(id) {
        if (selectHistory.includes(id)) {
            selectHistory.splice(selectHistory.indexOf(id), 1);
        }
        selectHistory.push(id);
    }

    function countSelected() {
        return values.filter((btn) => btn.selected).length;
    }

    function toggleFirstSuited(toValue) {
        const index = values.findIndex((itm) => (itm.selected = !toValue));
        if (index > -1) {
            values[index].selected = toValue;
            addToHistory(index);
        }
    }

    function selectUpToMin(cnt, indexOfCurrent) {
        let delta = min - cnt;
        if (!delta) {
            return;
        }
        for (let t in values) {
            if (t === indexOfCurrent) {
                continue;
            }
            if (!values[t].selected) {
                values[t].selected = true;
                addToHistory(t);
                delta--;
                if (!delta) {
                    break;
                }
            }
        }
    }

    function deselectDownToMin(cnt, indexOfCurrent) {
        let delta = cnt - max;
        if (!delta) {
            return;
        }
        for (let t in values) {
            if (t === indexOfCurrent) {
                continue;
            }
            if (values[t].selected) {
                values[t].selected = false;
                delta--;
                if (!delta) {
                    break;
                }
            }
        }
    }


    /**
     * @typedef {Object} Props
     * @property {any} [values]
     * @property {boolean} [centered]
     * @property {boolean} [right]
     * @property {string} [classes]
     * @property {any} [buttonComponent]
     * @property {any} [action]
     * @property {number} [min]
     * @property {number} [max]
     */

    /** @type {Props} */
    let {
        values = $bindable([]),
        centered = false,
        right = false,
        classes = "",
        buttonComponent = UIButtonSwitch,
        action = (ev, value, selected) => {
        let newSelected = !selected;
        const indexOfCurrent = values.indexOf((itm) => itm.value === value);
        const cnt = countSelected() + (newSelected ? 1 : -1);

        if (min) {
            if (cnt < min) {
                selectUpToMin(cnt, indexOfCurrent);
                values = values;
            }
        }
        if (max) {
            if (max < cnt) {
                deselectDownToMin(cnt, indexOfCurrent);
                values = values;
            }
        }
        if (newSelected) {
            addToHistory(indexOfCurrent);
        }
        return newSelected;
    },
        min = 0,
        max = 100
    } = $props();
</script>

<div
    class="buttons has-addons {centered ? 'is-centered' : ''} {right
        ? 'is-right'
        : ''} {classes}"
>
    {#each values as item (item.id)}
        {@const SvelteComponent = buttonComponent}
        <SvelteComponent
            {...item}
            bind:value={item.value}
            bind:selected={item.selected}
            action={item.action ? item.action : action}
            on:click
            on:change
        />
    {/each}
</div>
