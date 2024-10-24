<script>
    import { createBubbler } from 'svelte/legacy';

    const bubble = createBubbler();
    /**
     * @typedef {Object} Props
     * @property {any} urlFull
     * @property {any} url
     * @property {any} title
     * @property {string} [cors]
     * @property {number} [size]
     * @property {boolean} [contained]
     * @property {boolean} [covered]
     * @property {string} [classes]
     */

    /** @type {Props} */
    let {
        urlFull,
        url,
        title,
        cors = "anonymous",
        size = 64,
        contained = true,
        covered = true,
        classes = ""
    } = $props();

    let sizeStyle = $derived(isNaN(size) ? `is-${size}` : `is-${size}x${size}`);
    let containedStyle = $derived(contained ? "is-contained" : "");
    let coveredStyle = $derived(covered ? "is-covered" : "");
</script>

{#if urlFull}
    <a href={urlFull} alt={title} onclick={bubble('click')}>
        <figure
            class="image {sizeStyle} {containedStyle} {coveredStyle} {classes}"
        >
            <img class="" alt={title} src={url} crossOrigin={cors} />
        </figure>
    </a>
{:else}
    <figure
        class="image {sizeStyle} {containedStyle} {coveredStyle} {classes}"
        onclick={bubble('click')}
        onkeyup={bubble('keyup')}
        role="button"
        tabindex="0"
    >
        <img class="" alt={title} src={url} crossOrigin={cors} />
    </figure>
{/if}
