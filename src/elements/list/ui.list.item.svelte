<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    import UIButtons from "../button/ui.buttons.svelte";
    export let id;
    export let title;
    export let description;
    export let actions = [];
    export let classes = "";
    export let image = "";
</script>

<div
    class="list-item {classes}"
    on:click|preventDefault={() => {
        dispatch("click", { id, title, image });
    }}
>
    {#if image}
        <div
            class="list-item-image"
            on:click|preventDefault={() => {
                dispatch("clickImage", { id, title, image });
            }}
        >
            <figure class="image is-64x64">
                <img class="is-rounded" src={image} alt={title} />
            </figure>
        </div>
    {/if}
    <div
        class="list-item-content"
        on:click|preventDefault={() => {
            dispatch("clickContent", { id, title, image });
        }}
    >
        {#if title}
            <div
                class="list-item-title"
                on:click|preventDefault={() => {
                    dispatch("clickTitle", { id, title, image });
                }}
            >
                {title}
            </div>
        {/if}
        {#if description}
            <div
                class="list-item-description"
                on:click|preventDefault={() => {
                    dispatch("clickDescription", { id, title, image });
                }}
            >
                {description}
            </div>
        {/if}
    </div>
    {#if actions && actions.length}
        <div class="list-item-controls">
            <UIButtons values={actions} right={true} />
        </div>
    {/if}
</div>
