<script>
    import { createEventDispatcher, onMount } from "svelte";
    const dispatch = createEventDispatcher();

    import UIList from "./ui.list.svelte";
    export let fieldname = "list-select";
    export let variants = [];
    export let values = [];
    export let defaultSelectAll = true;
    export let selectedClass = "is-active";
    export let getId = (val) => {
        return val.id;
    };

    export const collectData = () => {
        return values;
    };

    //list UI
    export let listComponent = UIList;
    export let listComponentProps = {};

    function toggle({ detail }) {
        const value = detail;
        const id = getId(value);
        if (values.includes(id)) {
            values.splice(values.indexOf(id), 1);
        } else {
            values.push(id);
        }
        values = values;
        updateItemsClasses();
        dispatch("change", {
            field: fieldname,
            value: values,
        });
    }

    onMount(() => {
        if (selectedClass) {
            variants.forEach((val) => {
                values.push(getId(val));
            });
            values = values;
            updateItemsClasses();
        }
    });

    function updateItemsClasses() {
        for (let item of variants) {
            const id = getId(item);
            if (values.includes(id)) {
                addClass(item, selectedClass);
            } else {
                removeClass(item, selectedClass);
            }
        }
        variants = variants;
    }

    function addClass(item, cls) {
        const lst = item.classes.split(" ");
        if (!lst.includes(cls)) {
            lst.push(cls);
            item.classes = lst.join(" ");
        }
    }

    function removeClass(item, cls) {
        const lst = item.classes.split(" ");
        if (lst.includes(cls)) {
            lst.splice(lst.indexOf(cls), 1);
            item.classes = lst.join(" ");
        }
    }
</script>

<svelte:component
    this={listComponent}
    {listComponentProps}
    bind:items={variants}
    on:click={toggle}
/>
