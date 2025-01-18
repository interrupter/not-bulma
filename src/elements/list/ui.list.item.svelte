<script>
    import { onMount } from "svelte";

    import UITitle from "../various/ui.title.svelte";
    import UIButtons from "../button/ui.buttons.svelte";
    import UILinks from "../link/ui.links.svelte";
    import UIClickableDiv from "../block/ui.clickable.div.svelte";

    /**
     * @typedef {Object} Props
     * @property {number}   index
     * @property {string|object} title
     * @property {string|object} description
     * @property {array} [actions = []]
     * @property {array} [links = []]
     * @property {array} [listActions = []]
     * @property {array} [listLinks = []]
     * @property {string} [class = '']
     * @property {string} [commonClass = '']
     * @property {string|object} [image = '']
     * @property {object} value - value of item, will be passed to event handlers
     * @property {string|number} [index = -1] - index in array 0-length
     * @property {boolean} [first = false] - if first
     * @property {boolean} [last = false] - if last
     * @property {function} [titleComponent = UITitle] - customization
     * @property {object} [titleComponentProps]
     * @property {function} [descriptionComponent]
     * @property {object} [descriptionComponentProps = {}]
     * @property {function} [imageComponent]
     * @property {object} [imageComponentProps = {}]
     * @property {function} [onclick]
     * @property {function} [onclickTitle]
     * @property {function} [onclickDescription]
     * @property {function} [onclickImage]
     * @property {function} [onclickContent]
     */

    /** @type {Props} */
    let {
        title,
        description,
        actions = [],
        links = [],
        listActions = [],
        listLinks = [],
        class: classes = "",
        commonClass = "",
        image = "",
        value,
        index = -1,
        first = false,
        last = false,
        listItemContentComponent: UIListItemContentComponent,
        listItemContentComponentProps = {},
        titleRenderer,
        titleComponent: UITitleComponent = UITitle,
        titleComponentProps = { size: 6 },
        descriptionRenderer,
        descriptionComponent: UIDescriptionComponent,
        descriptionComponentProps = {},
        imageRenderer,
        imageComponent: UIImageComponent,
        imageComponentProps = {},
        onclick,
        onclickImage,
        onclickContent,
        onclickTitle,
        onclickDescription,
    } = $props();

    function onClick() {
        onclick && onclick(value);
    }

    let allActions = $state([]);
    let allLinks = $state([]);

    const callbackTemplate = (callback) => {
        return () => {
            if (callback) {
                onClick();
                callback && callback(value);
            }
        };
    };

    $effect(() => {
        allActions = [...actions, ...listActions].map((btn, index) => {
            return {
                ...btn,
                id: index,
                action: btn.action ? () => btn.action(value) : undefined,
            };
        });

        allLinks = [...links, ...listLinks].map((link, index) => {
            link.id = index;
            return link;
        });
    });

    const paramsSet = { title, description, image, value, index };

    const clickableItemElementAttributes = {
        role: "button",
        tabindex: "0",
        onclick: onClick,
        onkeyup: (e) => {
            if (e && e.key == "Enter") {
                onClick();
            }
        },
    };

    const additionalElementAttributes = onclick
        ? clickableItemElementAttributes
        : {};

    let imageProps = $state({});
    let titleProps = $state({});
    let descriptionProps = $state({});

    $effect(() => {
        if (typeof image === "object") {
            imageProps = { ...image };
        } else {
            imageProps = { image };
        }
    });

    $effect(() => {
        if (typeof title === "object") {
            titleProps = { ...title };
        } else {
            titleProps = { title };
        }
    });

    $effect(() => {
        if (typeof description === "object") {
            descriptionProps = { ...description };
        } else {
            descriptionProps = { description };
        }
    });
</script>

{#snippet itemContent()}
    {#if titleRenderer}
        {@render titleRenderer(paramsSet)}
    {:else if title}
        <UIClickableDiv
            class="list-item-title"
            callback={callbackTemplate(onclickTitle)}
        >
            {#if UITitleComponent}
                <UITitleComponent
                    {...titleProps}
                    {...titleComponentProps}
                    {onchange}
                />
            {:else}{title}{/if}
        </UIClickableDiv>
    {/if}

    {#if descriptionRenderer}
        {@render descriptionRenderer(paramsSet)}
    {:else if description}
        <UIClickableDiv
            class="list-item-description"
            callback={callbackTemplate(onclickDescription)}
        >
            {#if UIDescriptionComponent}
                <UIDescriptionComponent
                    {...descriptionProps}
                    {...descriptionComponentProps}
                    {onchange}
                    {onclick}
                />
            {:else}{description}{/if}
        </UIClickableDiv>
    {/if}
{/snippet}

<div
    {...additionalElementAttributes}
    class:is-clickable={onclick}
    class:list-item-last={last}
    class:list-item-first={first}
    class:list-item-odd={index % 2 === 1}
    class:list-item-even={index % 2 === 0}
    class="list-item {classes} {commonClass} {`list-item-at-${index}`}"
>
    {#if image}
        {#if imageRenderer}
            {@render imageRenderer(paramsSet)}
        {:else}
            <UIClickableDiv
                class="list-item-image"
                callback={callbackTemplate(onclickImage)}
            >
                {#if UIImageComponent}
                    <UIImageComponent {...imageProps} />
                {:else}
                    <figure class="image is-64x64">
                        <img
                            class="is-rounded"
                            src={image}
                            alt={title ? title?.title || title : image}
                        />
                    </figure>
                {/if}
            </UIClickableDiv>
        {/if}
    {/if}

    {#if UIListItemContentComponent}
        <UIListItemContentComponent {...listItemContentComponentProps}>
            {@render itemContent()}
        </UIListItemContentComponent>
    {:else}
        <UIClickableDiv
            class="list-item-content"
            callback={callbackTemplate(onclickContent)}
        >
            {@render itemContent()}</UIClickableDiv
        >
    {/if}

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
