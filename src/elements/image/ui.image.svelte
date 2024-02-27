<script>
    export let urlFull;
    export let url;
    export let title;
    export let cors = "anonymous";
    export let size = 64;
    export let contained = true;
    export let covered = true;

    $: sizeStyle = isNaN(size) ? `is-${size}` : `is-${size}x${size}`;
    $: containedStyle = contained ? "is-contained" : "";
    $: coveredStyle = covered ? "is-covered" : "";
</script>

{#if urlFull}
    <a href={urlFull} alt={title} on:click>
        <figure class="image {sizeStyle} {containedStyle} {coveredStyle}">
            <img class="" alt={title} src={url} crossOrigin={cors} />
        </figure>
    </a>
{:else}
    <figure
        class="image {sizeStyle} {containedStyle} {coveredStyle}"
        on:click
        on:keyup
        role="button"
        tabindex="0"
    >
        <img class="" alt={title} src={url} crossOrigin={cors} />
    </figure>
{/if}
