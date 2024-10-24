<script>
    import { LOCALE } from "../../locale";
    /**
     * @typedef {Object} Props
     * @property {any} [errors]
     * @property {boolean} [show]
     * @property {string} [classes]
     * @property {string} [id]
     */

    /** @type {Props} */
    let {
        errors = [],
        show = false,
        classes = "",
        id = "errors-list"
    } = $props();
</script>

{#if Array.isArray(errors) && errors.length}
    <p class="help {classes}" {id}>
        {#if show}
            {#each errors as error}
                <span>{$LOCALE[error]}</span>
            {/each}
        {:else}&nbsp;{/if}
    </p>
{/if}
