<script>
    /**
     * @typedef {Object} Props
     * @property {string} [urlFull]
     * @property {string} url
     * @property {string} [title]
     * @property {string} [alt]
     * @property {string} [cors='anonymous']
     * @property {number} [size = 64]
     * @property {number} [height]
     * @property {number} [width]
     * @property {boolean} [contained=false]
     * @property {boolean} [covered=false]
     * @property {boolean} [pointable]
     * @property {string} [class = '']
     * @property {function} [onclick]
     * @property {function} [onkeyup]
     */

    /** @type {Props} */
    let {
        urlFull,
        url,
        title,
        alt,
        cors = "anonymous",
        size = 64,
        width,
        height,
        contained = false,
        covered = false,
        pointable,
        class: classes = "",
        onclick = undefined,
        onkeyup = undefined,
    } = $props();
</script>

{#snippet imageFigure()}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <figure
        class="image {classes} {!width && !height
            ? isNaN(size)
                ? `is-${size}`
                : `is-${size}x${size}`
            : ''}"
        class:is-contained={contained}
        class:is-covered={covered}
        class:is-clickable={(onclick && pointable !== false) || pointable}
        style={(width ? `width: ${width};` : "") +
            (height ? `height: ${height};` : "")}
    >
        <img
            {onclick}
            {onkeyup}
            class=""
            alt={alt || title}
            {title}
            src={url}
            crossOrigin={cors}
        />
    </figure>
{/snippet}

{#if urlFull}
    <a href={urlFull} title={title || alt} {onclick}>
        {@render imageFigure()}
    </a>
{:else}
    {@render imageFigure()}
{/if}
