<script>
    import { fade } from "svelte/transition";
    import { onMount, onDestroy } from "svelte";

    import { UIButtonClose } from "../button";

    let overflowSave = $state("");

    const defaultCloseButtonProps = {
        class: "is-absolute is-sided-right is-sided-top",
        style: "--siding-right-size: 2rem; --siding-top-size: 2rem",
        size: "normal",
    };

    /**
     * @typedef {Object} Props
     * @property {boolean}  [closeButton = false]
     * @property {object}   [closeButtonProps = defaultCloseButtonProps]
     * @property {boolean}  [show = true]
     * @property {boolean}  [closeOnClick = true]
     * @property {number}   [layer = 1]
     * @property {string}   [class = ""]
     * @property {number}   [zIndexStep = 1000]
     * @property {string}   [role = 'button']
     * @property {string}   [tabIndex = 'button']
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        closeButton = false,
        closeButtonProps = defaultCloseButtonProps,
        show = true,
        closeOnClick = true,
        layer = 1,
        class: classes = "",
        children,
        onreject = () => false,
        zIndexStep = 1000,
        role = "button",
        tabIndex = "0",
    } = $props();

    function overlayClick(e) {
        if (closeOnClick) {
            closeOverlay(e);
        }
    }

    function closeButtonClick() {
        rejectOverlay();
    }

    function closeOverlay(e) {
        try {
            if (e && e.originalTarget) {
                const target = e.originalTarget;
                if (
                    target.classList &&
                    target.classList.contains("is-overlay")
                ) {
                    rejectOverlay();
                }
            }
            //eslint-disable-next-line no-empty
        } catch {}
    }

    function rejectOverlay(data = {}) {
        show = false;
        onreject(data);
    }

    onMount(() => {
        overflowSave = document.body.style.overflow;
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = overflowSave;
        }
    });

    onDestroy(() => {
        document.body.style.overflow = overflowSave;
    });
</script>

{#if show}
    <div
        transition:fade
        class="is-overlay not-overlay {classes}"
        onclick={overlayClick}
        onkeyup={overlayClick}
        {role}
        {tabIndex}
        style="z-index: {zIndexStep * layer};"
    >
        {#if closeButton}
            <UIButtonClose {...closeButtonProps} onclick={closeButtonClick} />
        {/if}
        {@render children?.()}
    </div>
{/if}
