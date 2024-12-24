<script>
    let overflowSave = $state("");

    import { fade } from "svelte/transition";

    import { onMount, onDestroy } from "svelte";

    /**
     * @typedef {Object} Props
     * @property {boolean} [closeButton]
     * @property {boolean} [show]
     * @property {boolean} [closeOnClick]
     * @property {string} [closeSize]
     * @property {number} [layer]
     * @property {string} [class]
     * @property {number}   [zIndexStep=1000]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        closeButton = false,
        show = true,
        closeOnClick = true,
        closeSize = "normal",
        layer = 1,
        class: classes = "",
        children,
        onreject = () => false,
        zIndexStep = 1000,
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
        role="button"
        tabindex="0"
        style="z-index: {zIndexStep * layer};"
    >
        {#if closeButton}
            <button
                aria-label="delete button"
                onclick={closeButtonClick}
                class="delete is-{closeSize}"
            ></button>
        {/if}
        {@render children?.()}
    </div>
{/if}
