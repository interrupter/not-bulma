<script>
    import { LOCALE } from "../../locale";

    import UIOverlay from "./ui.overlay.svelte";

    import UIBox from "../block/ui.box.svelte";
    import UIContent from "../block/ui.content.svelte";

    import UITitle from "../various/ui.title.svelte";
    import UIButtonsRow from "../button/ui.buttons.row.svelte";

    export let buttonsPosition = "bottom";
    export let closeButton = false;
    export let applyButton = false;

    export let show = false;
    export let loading = false;
    export let title = "Modal window";
    export let subtitle = "";
    export let classes = "";
    export let overlayClasses = "";
    export let buttonsClasses = "";

    export let WAITING_TEXT = "Обработка";
</script>

<UIOverlay
    {show}
    closeOnClick={false}
    closeButton={false}
    classes={overlayClasses}
>
    <UIBox {classes}>
        <UITitle size="2" title={$LOCALE[title]} subtitle={$LOCALE[subtitle]} />
        <UIContent>
            <div class="pageloader {loading ? 'is-active' : ''}">
                <span class="title">{$LOCALE[WAITING_TEXT]}</span>
            </div>

            {#if buttonsPosition === "top"}
                <UIButtonsRow
                    classes={buttonsClasses}
                    left={closeButton ? [closeButton] : []}
                    right={applyButton ? [applyButton] : []}
                ></UIButtonsRow>
            {/if}

            <slot />

            {#if buttonsPosition === "bottom"}
                <UIButtonsRow
                    classes={buttonsClasses || "is-footer"}
                    left={closeButton ? [closeButton] : []}
                    right={applyButton ? [applyButton] : []}
                ></UIButtonsRow>
            {/if}
        </UIContent>
    </UIBox>
</UIOverlay>
