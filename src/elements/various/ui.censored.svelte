<script>
    import "bulma-tooltip/dist/css/bulma-tooltip.min.css";

    /**
     * @typedef {Object} Props
     * @property {boolean}  [hidden = true]
     * @property {boolean}  [showable = true]
     * @property {boolean}  [copiable = true]
     * @property {string}   [copyIcon = 'copy']
     * @property {string}   [showIcon = 'eye']
     * @property {string}   [hideIcon = 'eye-slash']
     * @property {number}   [maxLength = 20]
     * @property {string}   [shadowClass = "has-background-primary-90"]
     * @property {boolean}  [tooltip = true]
     * @property {number}   [tooltipTTL = 2000]
     * @property {string}   [tooltipText = "Скопировано в буфер"]
     * @property {string}   [tooltipClass = "has-tooltip-info"]
     * @property {string}   [value = ""]
     * @property {function} [onerror]
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
        value = "",
        onerror,
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
            onerror && onerror(err);
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
        onkeydown={copyContent}
        role="button"
        tabindex="0"
        class={"icon is-small is-right is-clickable " +
            (tooltipActive ? ` ${tooltipClass} ` : "") +
            " is-vertical-middle"}><i class="fas fa-{copyIcon}"></i></span
    >
{/if}
{#if showable}
    <span
        class="icon is-small is-right is-clickable is-vertical-middle"
        onclick={toggleView}
        onkeydown={toggleView}
        role="button"
        tabindex="0"><i class="fas fa-{hidden ? showIcon : hideIcon}"></i></span
    >
{/if}
