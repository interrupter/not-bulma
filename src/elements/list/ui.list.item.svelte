<script>
    import { onMount } from "svelte";

    import UITitle from "../various/ui.title.svelte";
    import UIButtons from "../button/ui.buttons.svelte";
    import UILinks from "../link/ui.links.svelte";
    import UIClickableDiv from "../block/ui.clickable.div.svelte";

    /**
     * @typedef {Object} Props
     * @property {string|object} title
     * @property {string|object} description
     * @property {array} [actions = []]
     * @property {array} [links = []]
     * @property {array} [listActions = []]
     * @property {array} [listLinks = []]
     * @property {string} [class = '']
     * @property {string} [commonClass = '']
     * @property {string|object} [image = '']
     * @property {any} value - value of item, will be passed to event handlers
     * @property {string|number} [index = -1] - index in array 0-length
     * @property {boolean} [first = false] - if first
     * @property {boolean} [last = false] - if last
     * @property {function} [titleComponent = UITitle] - customization
     * @property {object} [titleComponentProps]
     * @property {function} [descriptionComponent]
     * @property {object} [descriptionComponentProps = {}]
     * @property {function} [imageComponent]
     * @property {object} [imageComponentProps = {}]
     * @property {function} [onclickImage]
     * @property {function} [onclickContent]
     * @property {function} [onclickTitle]
     * @property {function} [onclickDescription]
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
        titleComponent: UITitleComponent = UITitle,
        titleComponentProps = { size: 6 },
        descriptionComponent: UIDescriptionComponent,
        descriptionComponentProps = {},
        imageComponent: UIImageComponet,
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

    let _title = $state(title);
    let _description = $state(description);
    let _image = $state(image);

    const callbackTemplate = (callback) => {
        return () => {
            onClick();
            callback && callback(value);
        };
    };

    onMount(() => {
        allActions = [...actions, ...listActions].map((btn, index) => {
            return {
                ...btn,
                id: index,
                action: btn.action ? () => btn.action(value) : undefined,
            };
        });
        console.log(
            actions.length,
            "+",
            listActions.length,
            " = ",
            allActions.length,
            allActions
        );
        allLinks = [...links, ...listLinks].map((link, index) => {
            link.id = index;
            return link;
        });

        if (typeof title !== "object") {
            _title = { title: title };
        }
        if (typeof description !== "object") {
            _description = { value: description };
        }
        if (typeof image !== "object") {
            _image = { url: image };
        }
    });
</script>

<div
    role="button"
    tabindex="0"
    class:list-item-last={last}
    class:list-item-first={first}
    class:list-item-odd={index % 2 === 1}
    class:list-item-even={index % 2 === 0}
    class="list-item {classes} {commonClass} {`list-item-at-${index}`}"
    onclick={onClick}
    onkeyup={(e) => {
        if (e && e.key == "Enter") {
            onClick();
        }
    }}
>
    {#if image}
        <UIClickableDiv
            class="list-item-image"
            callback={callbackTemplate(onclickImage)}
        >
            {#if UIImageComponet}
                <UIImageComponet {..._image} {...imageComponentProps} />
            {:else}
                <figure class="image is-64x64">
                    <img class="is-rounded" src={image} alt={title} />
                </figure>
            {/if}
        </UIClickableDiv>
    {/if}
    <UIClickableDiv
        class="list-item-content"
        callback={callbackTemplate(onclickContent)}
    >
        {#if title}
            <UIClickableDiv
                class="list-item-title"
                callback={callbackTemplate(onclickTitle)}
            >
                {#if UITitleComponent}
                    <UITitleComponent
                        {..._title}
                        {...titleComponentProps}
                        {onchange}
                    />
                {:else}
                    {title}
                {/if}
            </UIClickableDiv>
        {/if}
        {#if description}
            <UIClickableDiv
                class="list-item-description"
                callback={callbackTemplate(onclickDescription)}
            >
                {#if UIDescriptionComponent}
                    <UIDescriptionComponent
                        {..._description}
                        {...descriptionComponentProps}
                        {onchange}
                        {onclick}
                    />
                {:else}
                    {description}
                {/if}
            </UIClickableDiv>
        {/if}
    </UIClickableDiv>

    {#if (allActions && allActions.length) || (allLinks && allLinks.length)}
        <div class="list-item-controls">
            {#if allActions && allActions.length}
                {@debug allActions}
                <UIButtons values={allActions} right={true} />
            {/if}
            {#if allLinks && allLinks.length}
                <UILinks values={allLinks} right={true} />
            {/if}
        </div>
    {/if}
</div>
