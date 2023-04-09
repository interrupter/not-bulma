<script>
    import { createEventDispatcher, onMount } from "svelte";
    const dispatch = createEventDispatcher();

    import UITitle from "../various/ui.title.svelte";
    import UIButtons from "../button/ui.buttons.svelte";

    export let title;
    export let description;
    export let actions = [];
    export let listActions = [];
    export let classes = "";
    export let commonClasses = "";
    export let image = "";
    //value of item, will be passed to event handlers
    export let value;
    //customization
    export let titleComponent = UITitle;
    export let titleComponentProps = { size: 6 };
    //
    export let descriptionComponent;
    export let descriptionComponentProps = {};
    //
    export let imageComponent;
    export let imageComponentProps = {};

    function onClick() {
        dispatch("click", value);
    }
    let allActions = [];
    $: allActions = [...actions, ...listActions].map((btn) => {
        return { ...btn, action: () => btn.action(value) };
    });
</script>

<div
    class="list-item {classes} {commonClasses}"
    on:click|preventDefault={onClick}
>
    {#if image}
        <div
            class="list-item-image"
            on:click|preventDefault={() => {
                onClick();
                dispatch("clickImage", value);
            }}
        >
            {#if imageComponent}
                <svelte:component
                    this={imageComponent}
                    value={image}
                    {...imageComponentProps}
                    on:change
                />
            {:else}
                <figure class="image is-64x64">
                    <img class="is-rounded" src={image} alt={title} />
                </figure>
            {/if}
        </div>
    {/if}
    <div
        class="list-item-content"
        on:click|preventDefault={() => {
            onClick();
            dispatch("clickContent", value);
        }}
    >
        {#if title}
            <div
                class="list-item-title"
                on:click|preventDefault={() => {
                    onClick();
                    dispatch("clickTitle", value);
                }}
            >
                {#if titleComponent}
                    {#if typeof title === "string"}
                        <svelte:component
                            this={titleComponent}
                            {title}
                            {...titleComponentProps}
                            on:change
                        />
                    {:else}
                        <svelte:component
                            this={titleComponent}
                            {...title}
                            {...titleComponentProps}
                            on:change
                        />
                    {/if}
                {:else}
                    {title}
                {/if}
            </div>
        {/if}
        {#if description}
            <div
                class="list-item-description"
                on:click|preventDefault={() => {
                    onClick();
                    dispatch("clickDescription", value);
                }}
            >
                {#if descriptionComponent}
                    <svelte:component
                        this={descriptionComponent}
                        value={description}
                        {...descriptionComponentProps}
                        on:change
                    />
                {:else}
                    {description}
                {/if}
            </div>
        {/if}
    </div>
    {#if allActions && allActions.length}
        <div class="list-item-controls">
            <UIButtons values={allActions} right={true} />
        </div>
    {/if}
</div>
