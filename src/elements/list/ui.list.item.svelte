<script>
    import { createEventDispatcher, onMount } from "svelte";
    const dispatch = createEventDispatcher();

    import UITitle from "../various/ui.title.svelte";
    import UIButtons from "../button/ui.buttons.svelte";
    import UILinks from "../link/ui.links.svelte";

    export let title;
    export let description;
    export let actions = [];
    export let links = [];
    export let listActions = [];
    export let listLinks = [];
    export let classes = "";
    export let commonClasses = "";
    export let image = "";
    //value of item, will be passed to event handlers
    export let value;
    //index in array 0-length
    export let index = -1;
    //if first
    export let first = false;
    //if last
    export let last = false;
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

    let allLinks = [];
    $: allLinks = [...links, ...listLinks];
</script>

<div
    role="button"
    tabindex="0"
    class="list-item {classes} {commonClasses} {last
        ? 'list-item-last'
        : ''} {first
        ? 'list-item-first'
        : ''}  {`list-item-at-${index}`} {`list-item-` +
        (index % 2 ? 'odd' : 'even')}"
    on:click={onClick}
    on:keyup={(e) => {
        if (e && e.key == "Enter") {
            onClick();
        }
    }}
>
    {#if image}
        <div
            role="button"
            tabindex="0"
            class="list-item-image"
            on:keyup|preventDefault={(e) => {
                if (e && e.key == "Enter") {
                    onClick();
                    dispatch("clickImage", value);
                }
            }}
            on:click|preventDefault={() => {
                onClick();
                dispatch("clickImage", value);
            }}
        >
            {#if imageComponent}
                {#if typeof image === "string"}
                    <svelte:component
                        this={imageComponent}
                        value={image}
                        {...imageComponentProps}
                    />
                {:else}
                    <svelte:component
                        this={imageComponent}
                        {...image}
                        {...imageComponentProps}
                    />
                {/if}
            {:else}
                <figure class="image is-64x64">
                    <img class="is-rounded" src={image} alt={title} />
                </figure>
            {/if}
        </div>
    {/if}
    <div
        role="button"
        tabindex="0"
        class="list-item-content"
        on:click|preventDefault={() => {
            onClick();
            dispatch("clickContent", value);
        }}
        on:keyup|preventDefault={(e) => {
            if (e && e.key == "Enter") {
                onClick();
                dispatch("clickContent", value);
            }
        }}
    >
        {#if title}
            <div
                class="list-item-title"
                role="button"
                tabindex="0"
                on:keyup|preventDefault={(e) => {
                    if (e && e.key == "Enter") {
                        onClick();
                        dispatch("clickTitle", value);
                    }
                }}
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
                role="button"
                tabindex="0"
                on:keyup|preventDefault={(e) => {
                    if (e && e.key == "Enter") {
                        onClick();
                        dispatch("clickDescription", value);
                    }
                }}
                class="list-item-description"
                on:click|preventDefault={() => {
                    onClick();
                    dispatch("clickDescription", value);
                }}
            >
                {#if descriptionComponent}
                    {#if typeof description === "string"}
                        <svelte:component
                            this={descriptionComponent}
                            value={description}
                            {...descriptionComponentProps}
                            on:change
                            on:click
                        />
                    {:else}
                        <svelte:component
                            this={descriptionComponent}
                            {...description}
                            {...descriptionComponentProps}
                            on:change
                            on:click
                        />
                    {/if}
                {:else}
                    {description}
                {/if}
            </div>
        {/if}
    </div>

    {#if (allActions && allActions.length) || (allLinks && allLinks.length)}
        <div class="list-item-controls">
            {#if allActions && allActions.length}
                <UIButtons values={allActions} right={true} />
            {/if}
            {#if allLinks && allLinks.length}
                <UILinks values={allLinks} right={true} />
            {/if}
        </div>
    {/if}
</div>
