<script>
    let overflowSave = "";

    import { fade } from "svelte/transition";

    import { createEventDispatcher, onMount, onDestroy } from "svelte";

    const zIndexStep = 1000;

    const dispatch = createEventDispatcher();

    export let closeButton = false;
    export let show = true;
    export let closeOnClick = true;
    export let closeSize = "normal";
    export let layer = 1;
    export let classes = "";

    $: if (show) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = overflowSave;
    }

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
        on:click={overlayClick}
        on:keyup={overlayClick}
        role="button"
        tabindex="0"
        style="z-index: {zIndexStep * layer};"
    >
        {#if closeButton}
            <button on:click={closeButtonClick} class="delete is-{closeSize}" />
        {/if}
        <slot />
    </div>
{/if}
