<script>
    import { LOCALE } from "../../locale";
    import UICommon from "../common";

    export let id = `title-${Math.random()}`;
    export let title = "";
    export let subtitle;
    export let size = 1;
    export let subsize;
    export let spaced = false;
    export let align = "left";

    export const scrollToTop = (options = UICommon.SCROLL_OPTIONS) => {
        setTimeout(() => {
            document.getElementById(id).scrollIntoView(options);
        }, 100);
    };

    let size2;
    $: size2 = subsize
        ? subsize
        : parseInt(size) < 6
        ? parseInt(size) + 1
        : size;
    $: spacedStyle = spaced ? "is-spaced" : "";

    $: resultTitle = `<h${size} id="${id}" style="text-align: ${align};" class="title ${spacedStyle} is-${size}">${$LOCALE[title]}</h${size}>`;
    $: resultSubtitle = `<h${size2} id="${id}" style="text-align: ${align};" class="subtitle is-${size2}">${$LOCALE[subtitle]}</h${size2}>`;
</script>

{#if title}
    {@html resultTitle}
{/if}

{#if subtitle}
    {@html resultSubtitle}
{/if}
