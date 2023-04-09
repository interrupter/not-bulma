<script>
    import { onMount, createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    //
    import { UIColumns, UIColumn } from "../layout";
    import UIListSelect from "./ui.list.select.svelte";
    import UITitle from "../various/ui.title.svelte";
    import UIImage from "../image/ui.image.svelte";

    export let fieldname = "list-select-group";
    /*
    [
        //array of groups
        {
            id:number,
            title:string|object,
            image:string|object,
            variants = [
                //array of values variants in group
                {
                id:number,
                title:string|object,
                description:string|object,
                image:string|object,
                value:object
            }]
        }
    ]
    */
    export let variants = [];
    /*
    [
        //array of arrays of selected values in group
        //if no selection group should be empty array
        ...[...selected_variants_values_in_group]
    ]
    */
    export let value = [];
    //
    export let titleComponent = UITitle;
    export let titleComponentProps = { size: 5 };
    //
    export let imageComponent = UIImage;
    export let imageComponentProps = { covered: true, contained: true };
    //
    export let listComponent = UIListSelect;
    export let listComponentProps = {};

    $: {
        variants.length;
        initValue();
    }

    onMount(() => {});

    function initValue() {
        value = variants.map(() => []);
        value = value;
    }

    function updateSelectedInGroup(groupId, values) {
        const index = variants.findIndex((val) => val.id === groupId);
        value[index] = [...values];
        value = value;
        dispatch("change", {
            field: fieldname,
            value,
        });
    }
</script>

{#each variants as variantsGroup (variantsGroup.id)}
    {#if variantsGroup.title}
        {#if typeof variantsGroup.title === "string"}
            <svelte:component
                this={titleComponent}
                {...titleComponentProps}
                title={variantsGroup.title}
                subtitle={variantsGroup.subtitle}
            />
        {:else}
            <svelte:component
                this={titleComponent}
                {...titleComponentProps}
                {...variantsGroup.title}
            />
        {/if}
    {/if}
    <UIColumns>
        {#if variantsGroup.image}
            <UIColumn>
                {#if typeof variantsGroup.title === "string"}
                    <svelte:component
                        this={imageComponent}
                        {...imageComponentProps}
                        url={variantsGroup.image}
                    />
                {:else}
                    <svelte:component
                        this={imageComponent}
                        {...imageComponentProps}
                        {...variantsGroup.image}
                    />
                {/if}
            </UIColumn>
        {/if}
        <UIColumn>
            <svelte:component
                this={listComponent}
                {...listComponentProps}
                variants={variantsGroup.variants}
                on:change={({ detail }) => {
                    updateSelectedInGroup(variantsGroup.id, detail.value);
                }}
            />
        </UIColumn>
    </UIColumns>
{/each}
