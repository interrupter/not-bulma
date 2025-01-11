<script>
    import "bulma-pageloader";
    import { LOCALE } from "../../locale";

    import { onDestroy, onMount } from "svelte";

    //hidden - no loader
    //container - parent container of form

    /**
     * @typedef {Object} Props
     * @property {boolean}  [loading = false]       state if form loading
     * @property {string}   [size = 'container']    (page, container, hidden)
     * @property {string}   [title = 'Waiting...']  LC string
     * @property {number}   [ttl]                   time to live, will be closed after ttl ms
     * @property {snippet}  [children]              snippets may be provided
     */

    /** @type {Props} */
    let {
        loading = false,
        size = "container",
        title = "Waiting...",
        ttl,
        onreject,
        children,
    } = $props();

    let ttlTimer;

    onMount(() => {
        if (ttl) {
            ttlTimer = setTimeout(() => {
                loading = false;
                onreject();
            }, ttl);
        }
    });

    onDestroy(() => {
        if (ttlTimer) {
            clearTimeout(ttlTimer);
        }
    });
</script>

{#if size !== "hidden"}
    <div
        class={size === "page" ? "pageloader" : "containerloader"}
        class:is-active={loading}
    >
        {#if children}
            {@render children?.()}
        {:else}
            <span class="title">{$LOCALE[title]}</span>
        {/if}
    </div>
{/if}
