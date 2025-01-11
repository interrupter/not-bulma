<script>
    /* eslint svelte/no-at-html-tags: 0 */

    import { LOCALE } from "../../locale";
    import UICommon from "../common";

    /**
     * @typedef {Object} Props
     * @property {string}   [id = `title-${Math.random()}`]
     * @property {string}   [title = '']
     * @property {string}   [subtitle]
     * @property {number}   [size = 1]
     * @property {number}   [subsize]
     * @property {boolean}  [spaced = false]
     * @property {string}   [align = 'left']
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

    let spacedStyle = $derived(spaced ? "has-text-justified" : "");

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
