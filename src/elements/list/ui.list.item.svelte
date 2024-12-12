<script>
    import { onMount } from "svelte";

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
        imageComponentProps = {},
        onclickImage = () => false,
        onclickContent = () => false,
        onclickTitle = () => false,
        onclickDescription = () => false,
    } = $props();

    function onClick() {
        onclick(value);
    }

    let allActions = $state([]);
    let allLinks = $state([]);

    onMount(() => {
        allActions = [...actions, ...listActions].map((btn) => {
            return { ...btn, action: () => btn.action(value) };
        });
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
            onkeyup={(e) => {
                e.preventDefault();
                if (e && e.key == "Enter") {
                    onClick();
                    onclickImage(value);
                }
            }}
            onclick={(e) => {
                e.preventDefault();
                onClick();
                onclickImage(value);
            }}
        >
            {#if imageComponent}
                {#if typeof image === "string"}
                    {@const SvelteComponent = imageComponent}
                    <SvelteComponent value={image} {...imageComponentProps} />
                {:else}
                    {@const SvelteComponent_1 = imageComponent}
                    <SvelteComponent_1 {...image} {...imageComponentProps} />
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
        onclick={(e) => {
            e.preventDefault();
            onClick();
            onclickContent(value);
        }}
        onkeyup={(e) => {
            e.preventDefault();
            if (e && e.key == "Enter") {
                onClick();
                onclickContent(value);
            }
        }}
    >
        {#if title}
            <div
                class="list-item-title"
                role="button"
                tabindex="0"
                onkeyup={(e) => {
                    e.preventDefault();
                    if (e && e.key == "Enter") {
                        onClick();
                        onclickTitle(value);
                    }
                }}
                onclick={(e) => {
                    e.preventDefault();
                    onClick();
                    onclickTitle(value);
                }}
            >
                {#if titleComponent}
                    {#if typeof title === "string"}
                        {@const SvelteComponent_2 = titleComponent}
                        <SvelteComponent_2
                            {title}
                            {...titleComponentProps}
                            {onchange}
                        />
                    {:else}
                        {@const SvelteComponent_3 = titleComponent}
                        <SvelteComponent_3
                            {...title}
                            {...titleComponentProps}
                            {onchange}
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
                onkeyup={(e) => {
                    e.preventDefault();
                    if (e && e.key == "Enter") {
                        onClick();
                        onclickDescription(value);
                    }
                }}
                class="list-item-description"
                onclick={(e) => {
                    e.preventDefault();
                    onClick();
                    onclickDescription(value);
                }}
            >
                {#if descriptionComponent}
                    {#if typeof description === "string"}
                        {@const SvelteComponent_4 = descriptionComponent}
                        <SvelteComponent_4
                            value={description}
                            {...descriptionComponentProps}
                            {onchange}
                            {onclick}
                        />
                    {:else}
                        {@const SvelteComponent_5 = descriptionComponent}
                        <SvelteComponent_5
                            {...description}
                            {...descriptionComponentProps}
                            {onchange}
                            {onclick}
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
