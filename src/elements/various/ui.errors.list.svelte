<script>
    import { LOCALE } from "../../locale";
    /**
     * @typedef {Object} Props
     * @property {array<string>}  [errors = []]
     * @property {boolean} [show = false]
     * @property {string} [class = '']
     * @property {string} [id = 'errors-list']
     */

    /** @type {Props} */
    let {
        errors = [],
        show = false,
        class: classes = "",
        id = "errors-list",
    } = $props();
</script>

{#if Array.isArray(errors) && errors.length}
    <p class="help {classes}" {id}>
        {#if show}
            {#each errors as error, index}
                <span>{$LOCALE[error]}</span>{index < errors.length - 1
                    ? ", "
                    : ""}
            {/each}
        {:else}&nbsp;{/if}
    </p>
{/if}
