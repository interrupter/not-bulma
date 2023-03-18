<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import UITitle from "../various/ui.title.svelte";
    import UIButtons from "../button/ui.buttons.svelte";

    export let title;
    export let description;
    export let actions = [];
    export let classes = "";
    export let image = "";
    //value of item, will be passed to event handlers
    export let value;
    //customization
    export let titleComponent = UITitle;
    export let titleComponentProps = { size: 6 };
    export let descriptionComponent;
    export let descriptionComponentProps = {};
    export let imageComponent;
    export let imageComponentProps = {};

    function onClick() {
        dispatch("click", value);
    }
</script>

<div class="list-item {classes}" on:click|preventDefault={onClick}>
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
                    <svelte:component
                        this={titleComponent}
                        {title}
                        {...titleComponentProps}
                    />
                {:else}
                    {description}
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
                    />
                {:else}
                    {description}
                {/if}
            </div>
        {/if}
    </div>
    {#if actions && actions.length}
        <div class="list-item-controls">
            <UIButtons values={actions} right={true} />
        </div>
    {/if}
</div>
