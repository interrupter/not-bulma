<script>
    import { run, preventDefault } from 'svelte/legacy';

    import { createEventDispatcher, onMount } from "svelte";
    const dispatch = createEventDispatcher();

    import UITitle from "../various/ui.title.svelte";
    import UIButtons from "../button/ui.buttons.svelte";
    import UILinks from "../link/ui.links.svelte";

    
    
    
    
    
    
    
    /**
     * @typedef {Object} Props
     * @property {any} title
     * @property {any} description
     * @property {any} [actions]
     * @property {any} [links]
     * @property {any} [listActions]
     * @property {any} [listLinks]
     * @property {string} [classes]
     * @property {string} [commonClasses]
     * @property {string} [image]
     * @property {any} value - value of item, will be passed to event handlers
     * @property {any} [index] - index in array 0-length
     * @property {boolean} [first] - if first
     * @property {boolean} [last] - if last
     * @property {any} [titleComponent] - customization
     * @property {any} [titleComponentProps]
     * @property {any} descriptionComponent
     * @property {any} [descriptionComponentProps]
     * @property {any} imageComponent
     * @property {any} [imageComponentProps]
     */

    /** @type {Props} */
    let {
        title,
        description,
        actions = [],
        links = [],
        listActions = [],
        listLinks = [],
        classes = "",
        commonClasses = "",
        image = "",
        value,
        index = -1,
        first = false,
        last = false,
        titleComponent = UITitle,
        titleComponentProps = { size: 6 },
        descriptionComponent,
        descriptionComponentProps = {},
        imageComponent,
        imageComponentProps = {}
    } = $props();

    function onClick() {
        dispatch("click", value);
    }

    let allActions = $state([]);
    run(() => {
        allActions = [...actions, ...listActions].map((btn) => {
            return { ...btn, action: () => btn.action(value) };
        });
    });

    let allLinks = $state([]);
    run(() => {
        allLinks = [...links, ...listLinks];
    });
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
    onclick={onClick}
    onkeyup={(e) => {
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
            onkeyup={preventDefault((e) => {
                if (e && e.key == "Enter") {
                    onClick();
                    dispatch("clickImage", value);
                }
            })}
            onclick={preventDefault(() => {
                onClick();
                dispatch("clickImage", value);
            })}
        >
            {#if imageComponent}
                {#if typeof image === "string"}
                    {@const SvelteComponent = imageComponent}
                    <SvelteComponent
                        value={image}
                        {...imageComponentProps}
                    />
                {:else}
                    {@const SvelteComponent_1 = imageComponent}
                    <SvelteComponent_1
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
        onclick={preventDefault(() => {
            onClick();
            dispatch("clickContent", value);
        })}
        onkeyup={preventDefault((e) => {
            if (e && e.key == "Enter") {
                onClick();
                dispatch("clickContent", value);
            }
        })}
    >
        {#if title}
            <div
                class="list-item-title"
                role="button"
                tabindex="0"
                onkeyup={preventDefault((e) => {
                    if (e && e.key == "Enter") {
                        onClick();
                        dispatch("clickTitle", value);
                    }
                })}
                onclick={preventDefault(() => {
                    onClick();
                    dispatch("clickTitle", value);
                })}
            >
                {#if titleComponent}
                    {#if typeof title === "string"}
                        {@const SvelteComponent_2 = titleComponent}
                        <SvelteComponent_2
                            {title}
                            {...titleComponentProps}
                            on:change
                        />
                    {:else}
                        {@const SvelteComponent_3 = titleComponent}
                        <SvelteComponent_3
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
                onkeyup={preventDefault((e) => {
                    if (e && e.key == "Enter") {
                        onClick();
                        dispatch("clickDescription", value);
                    }
                })}
                class="list-item-description"
                onclick={preventDefault(() => {
                    onClick();
                    dispatch("clickDescription", value);
                })}
            >
                {#if descriptionComponent}
                    {#if typeof description === "string"}
                        {@const SvelteComponent_4 = descriptionComponent}
                        <SvelteComponent_4
                            value={description}
                            {...descriptionComponentProps}
                            on:change
                            on:click
                        />
                    {:else}
                        {@const SvelteComponent_5 = descriptionComponent}
                        <SvelteComponent_5
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
