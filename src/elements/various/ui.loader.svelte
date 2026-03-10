<script>
    import "bulma-pageloader";
    import { LOCALE } from "../../locale";

    //hidden - no loader
    //container - parent container of form

    /**
     * @typedef {Object} Props
     * @property {boolean} [loading] - state if form loading
     * @property {string} [size] - page - whole page
     * @property {string} [title]
     */

    /** @type {Props} */
    let {
        class: classes = "loader-size-40-100",
        loading = false,
        size = "container",
        title = "Waiting...",
        loaderContent,
        children,
    } = $props();

    const showWhenSizeIs = ["page", "container"];
</script>

{#snippet loaderTitle()}
    <span class="title">{$LOCALE[title]}</span>
{/snippet}

<div class="loader-wrapper">
    {@render children?.()}
    {#if showWhenSizeIs.includes(size) && loading}
        <div class={`${size}loader is-active ${classes}`}>
            {#if loaderContent}
                {@render loaderContent(size, title)}
            {:else}{/if}
        </div>
    {/if}
</div>
