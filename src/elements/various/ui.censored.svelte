<script>
    import "bulma-tooltip/dist/css/bulma-tooltip.min.css";
    export let hidden = true;
    export let showable = true;
    export let copiable = true;

    export let copyIcon = "copy";
    export let showIcon = "eye";
    export let hideIcon = "eye-slash";
    export let maxLength = 20;
    export let tooltip = true;
    export let tooltipTTL = 2000;
    export let tooltipText = "Скопировано в буфер";
    export let tooltipClass = "has-tooltip-info";

    export let value = "";

    function toggleView() {
        hidden = !hidden;
    }

    let contentCopied = false,
        tooltipActive,
        tooltipTarget;

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

    $: tooltipActive = tooltip && contentCopied;
</script>

<p>
    <span
        class={hidden ? "is-censored has-background-primary-90" : ""}
        style={`display:inline-block; width: ${maxLength}rem; height: var(--bulma-size-normal);overflow-x:hidden;`}
        >{hidden ? "" : value}</span
    >
    {#if copiable}
        <span
            bind:this={tooltipTarget}
            on:click={copyContent}
            class={"icon is-small is-right is-clickable " +
                (tooltipActive ? ` ${tooltipClass} ` : "")}
            ><i class="fas fa-{copyIcon}" /></span
        >
    {/if}
    {#if showable}
        <span class="icon is-small is-right is-clickable" on:click={toggleView}
            ><i class="fas fa-{hidden ? showIcon : hideIcon}" /></span
        >
    {/if}
</p>
