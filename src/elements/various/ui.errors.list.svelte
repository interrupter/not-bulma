<script>
    import { LOCALE } from "../../locale";
    export let errors = [];
    export let show = false;
    export let classes = "";
    export let id = "errors-list";
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
