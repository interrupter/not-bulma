<script>
    import UIOverlay from "./ui.overlay.svelte";

    import UIBox from "../block/ui.box.svelte";
    import UIContent from "../block/ui.content.svelte";

    import UITitle from "../various/ui.title.svelte";
    import UIButtonsRow from "../button/ui.buttons.row.svelte";
    import { UILoader } from "../various";

    /**
     * @typedef {Object} Props
     * @property {string} [buttonsPosition = "bottom"]           top, topOfContent, bottom
     * @property {boolean} [fullscreen = false]
     * @property {boolean} [closeButton = false]
     * @property {boolean} [applyButton = false]
     * @property {number} [titleSize = 2]
     * @property {boolean} [show = false]
     * @property {boolean} [loading = false]
     * @property {string} [title= "Modal window"]
     * @property {string} [subtitle = ""]
     * @property {string} [class = ""]
     * @property {string} [overlayClass = ""]
     * @property {string} [buttonsClass = ""]
     * @property {string} [WAITING_TEXT = "Обработка"]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        buttonsPosition = "bottom",
        fullscreen = false,
        closeButton = false,
        applyButton = false,
        titleSize = 2,
        show = false,
        loading = false,
        title = "Modal window",
        subtitle = "",
        class: classes = "",
        overlayClass: overlayClass = "",
        buttonsClass: buttonsClass = "",
        WAITING_TEXT = "Обработка",
        children,
    } = $props();
</script>

{#snippet buttons(moreClassess = "")}
    <UIButtonsRow
        class={buttonsClass || moreClassess}
        left={closeButton ? [closeButton] : []}
        right={applyButton ? [applyButton] : []}
    />
{/snippet}

<UIOverlay {show} closeOnClick={false} closeButton={false} class={overlayClass}>
    <UIBox class={`${classes} ${fullscreen ? "is-fullscreen" : ""}`}>
        {#if buttonsPosition === "top"}
            {@render buttons("")}
        {/if}
        <UITitle size={titleSize} {title} {subtitle} />
        <UIContent>
            <UILoader size="page" {loading} title={WAITING_TEXT} />

            {#if buttonsPosition === "topOfContent"}
                {@render buttons("")}
            {/if}

            {@render children?.()}

            {#if buttonsPosition === "bottom"}
                {@render buttons(`is-mobile ${fullscreen ? "is-footer" : ""}`)}
            {/if}
        </UIContent>
    </UIBox>
</UIOverlay>
