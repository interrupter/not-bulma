<script>
    import { run } from 'svelte/legacy';

    let overflowSave = $state("");

    import { fade } from "svelte/transition";

    import { createEventDispatcher, onMount, onDestroy } from "svelte";

    const zIndexStep = 1000;

    const dispatch = createEventDispatcher();

    /**
     * @typedef {Object} Props
     * @property {boolean} [closeButton]
     * @property {boolean} [show]
     * @property {boolean} [closeOnClick]
     * @property {string} [closeSize]
     * @property {number} [layer]
     * @property {string} [classes]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        closeButton = false,
        show = true,
        closeOnClick = true,
        closeSize = "normal",
        layer = 1,
        classes = "",
        children
    } = $props();

    run(() => {
        if (show) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = overflowSave;
        }
    });

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
        } catch (_) {}
    }

    function rejectOverlay(data = {}) {
        dispatch("reject", data);
    }
    /*
	function resolveOverlay(data = {}) {
	  dispatch('resolve', data);
	}
*/
    onMount(() => {
        overflowSave = document.body.style.overflow;
    });

    onDestroy(() => {
        document.body.style.overflow = overflowSave;
    });
</script>

{#if show}
    <div
        class="is-overlay not-overlay {classes}"
        transition:fade
        onclick={overlayClick}
        onkeyup={overlayClick}
        role="button"
        tabindex="0"
        style="z-index: {zIndexStep * layer};"
    >
        {#if closeButton}
            <button onclick={closeButtonClick} class="delete is-{closeSize}"></button>
        {/if}
        {@render children?.()}
    </div>
{/if}
