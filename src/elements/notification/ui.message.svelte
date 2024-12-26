<script>
    import { LOCALE } from "../../locale";

    let {
        title,
        titleSnip,
        message,
        messageSnip,
        class: classes = "",
        color,
    } = $props();
</script>

<article class="message {classes} {color ? `is-${color}` : ''}">
    <div class="message-header">
        {#if titleSnip}
            {@render titleSnip(title)}
        {:else}
            <p>{$LOCALE[title]}</p>
        {/if}
    </div>
    <div class="message-body">
        {#if messageSnip}
            {@render messageSnip(message)}
        {:else}
            <p>{$LOCALE[message]}</p>
        {/if}
    </div>
</article>
