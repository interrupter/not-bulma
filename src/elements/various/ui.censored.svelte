<script>
    export let hidden = true;
    export let showable = true;
    export let copiable = true;

    export let copyIcon = "copy";
    export let showIcon = "eye";
    export let hideIcon = "eye-slash";

    export let value = "";

    function toggleView() {
        hidden != hidden;
    }

    async function copyContent() {
        try {
            await navigator.clipboard.writeText(value);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    }
</script>

<span
    class={hidden ? "is-censored has-background-primary-90" : ""}
    style={hidden ? "width: {value.length}rem;" : ""}
    >{hidden ? "" : value}</span
>
{#if copiable}
    <span on:click={copyContent} class="icon is-small is-right"
        ><i class="fas fa-{copyIcon}" /></span
    >
{/if}
{#if showable}
    <span class="icon is-small is-right" on:click={toggleView}
        ><i class="fas fa-{hidden ? showIcon : hideIcon}" /></span
    >
{/if}
