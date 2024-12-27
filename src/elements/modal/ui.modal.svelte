<script>
    import { LOCALE } from "../../locale";

    import UIOverlay from "./ui.overlay.svelte";

    import UIBox from "../block/ui.box.svelte";
    import UIContent from "../block/ui.content.svelte";

    import UITitle from "../various/ui.title.svelte";
    import UIButtonsRow from "../button/ui.buttons.row.svelte";

    /**
     * @typedef {Object} Props
     * @property {string} [buttonsPosition]
     * @property {boolean} [closeButton]
     * @property {boolean} [applyButton]
     * @property {number} [titleSize]
     * @property {boolean} [show]
     * @property {boolean} [loading]
     * @property {string} [title]
     * @property {string} [subtitle]
     * @property {string} [classes]
     * @property {string} [overlayClasses]
     * @property {string} [buttonsClasses]
     * @property {string} [WAITING_TEXT]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        buttonsPosition = "bottom",
        closeButton = false,
        applyButton = false,
        titleSize = 2,
        show = false,
        loading = false,
        title = "Modal window",
        subtitle = "",
        classes: classes = "",
        overlayClasses = "",
        buttonsClasses = "",
        WAITING_TEXT = "Обработка",
        children,
    } = $props();
</script>

<UIOverlay
    {show}
    closeOnClick={false}
    closeButton={false}
    class={overlayClasses}
>
    <UIBox class={classes}>
        <UITitle
            size={titleSize}
            title={$LOCALE[title]}
            subtitle={$LOCALE[subtitle]}
        />
        <UIContent>
            <div class="pageloader" class:is-active={loading}>
                <span class="title">{$LOCALE[WAITING_TEXT]}</span>
            </div>

            {#if buttonsPosition === "top"}
                <UIButtonsRow
                    class={buttonsClasses}
                    left={closeButton ? [closeButton] : []}
                    right={applyButton ? [applyButton] : []}
                ></UIButtonsRow>
            {/if}

            {@render children?.()}

            {#if buttonsPosition === "bottom"}
                <UIButtonsRow
                    class={buttonsClasses || "is-footer is-mobile"}
                    left={closeButton ? [closeButton] : []}
                    right={applyButton ? [applyButton] : []}
                ></UIButtonsRow>
            {/if}
        </UIContent>
    </UIBox>
</UIOverlay>
