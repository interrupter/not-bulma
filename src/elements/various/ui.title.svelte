<script>
    /* eslint svelte/no-at-html-tags: 0 */

    import { LOCALE } from "../../locale";
    import UICommon from "../common";

    /**
     * @typedef {Object} Props
     * @property {any} [id]
     * @property {string} [title]
     * @property {any} subtitle
     * @property {number} [size]
     * @property {any} subsize
     * @property {boolean} [spaced]
     * @property {string} [align]
     */

    /** @type {Props} */
    let {
        id = `title-${Math.random()}`,
        title = "",
        subtitle,
        size = 1,
        subsize,
        spaced = false,
        align = "left",
    } = $props();

    export const scrollToTop = (options = UICommon.SCROLL_OPTIONS) => {
        setTimeout(() => {
            document.getElementById(id).scrollIntoView(options);
        }, 100);
    };

    let size2 = $derived(
        subsize ? subsize : parseInt(size) < 6 ? parseInt(size) + 1 : size
    );

    let spacedStyle = $derived(spaced ? "is-spaced" : "");

    let resultTitle = $derived(
        `<h${size} id="${id}" style="text-align: ${align};" class="title ${spacedStyle} is-${size}">${$LOCALE[title]}</h${size}>`
    );
    let resultSubtitle = $derived(
        `<h${size2} id="${id}" style="text-align: ${align};" class="subtitle is-${size2}">${$LOCALE[subtitle]}</h${size2}>`
    );
</script>

{#if title}
    {@html resultTitle}
{/if}

{#if subtitle}
    {@html resultSubtitle}
{/if}
