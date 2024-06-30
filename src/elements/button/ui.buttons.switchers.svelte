<script>
    import { createEventDispatcher, onMount } from "svelte";
    const dispatch = createEventDispatcher();
    import UIButtonSwitch from "./ui.button.switch.svelte";

    export let values = [];
    export let centered = false;
    export let right = false;
    export let classes = "";
    export let buttonComponent = UIButtonSwitch;

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

    export let action = (ev, value, selected) => {
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
    };

    export let min = 0;
    export let max = 100;
</script>

<div
    class="buttons has-addons {centered ? 'is-centered' : ''} {right
        ? 'is-right'
        : ''} {classes}"
>
    {#each values as item (item.id)}
        <svelte:component
            this={buttonComponent}
            {...item}
            bind:value={item.value}
            bind:selected={item.selected}
            action={item.action ? item.action : action}
            on:click
            on:change
        />
    {/each}
</div>
