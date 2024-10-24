<script>
    import "bulma-tooltip/dist/css/bulma-tooltip.min.css";


    /**
     * @typedef {Object} Props
     * @property {boolean} [hidden]
     * @property {boolean} [showable]
     * @property {boolean} [copiable]
     * @property {string} [copyIcon]
     * @property {string} [showIcon]
     * @property {string} [hideIcon]
     * @property {number} [maxLength]
     * @property {string} [shadowClass]
     * @property {boolean} [tooltip]
     * @property {number} [tooltipTTL]
     * @property {string} [tooltipText]
     * @property {string} [tooltipClass]
     * @property {string} [value]
     */

    /** @type {Props} */
    let {
        hidden = $bindable(true),
        showable = true,
        copiable = true,
        copyIcon = "copy",
        showIcon = "eye",
        hideIcon = "eye-slash",
        maxLength = 20,
        shadowClass = "has-background-primary-90",
        tooltip = true,
        tooltipTTL = 2000,
        tooltipText = "Скопировано в буфер",
        tooltipClass = "has-tooltip-info",
        value = ""
    } = $props();

    function toggleView() {
        hidden = !hidden;
    }

    let contentCopied = $state(false),
        tooltipActive = $derived(tooltip && contentCopied),
        tooltipTarget = $state();

    async function copyContent() {
        try {
            await navigator.clipboard.writeText(value);
            if (tooltip) {
                contentCopied = true;
                tooltipTarget.dataset.tooltip = tooltipText;
                setTimeout(() => {
                    contentCopied = false;
                    tooltipTarget.removeAttribute("data-tooltip");
                }, tooltipTTL);
            }
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    }

    
</script>

<span
    class={(hidden ? "is-censored " + shadowClass : "") +
        " is-vertical-middle "}
    style={`display:inline-block; width: ${maxLength}rem; height: var(--bulma-size-medium); overflow-x:hidden;`}
    >{hidden ? "" : value}</span
>
{#if copiable}
    <span
        bind:this={tooltipTarget}
        onclick={copyContent}
        class={"icon is-small is-right is-clickable " +
            (tooltipActive ? ` ${tooltipClass} ` : "") +
            " is-vertical-middle"}><i class="fas fa-{copyIcon}"></i></span
    >
{/if}
{#if showable}
    <span
        class="icon is-small is-right is-clickable is-vertical-middle"
        onclick={toggleView}
        ><i class="fas fa-{hidden ? showIcon : hideIcon}"></i></span
    >
{/if}
