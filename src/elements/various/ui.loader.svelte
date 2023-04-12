<script>
    import "bulma-pageloader";
    import { LOCALE } from "../../locale";
    //state if form loading
    export let loading = false;
    //hidden - no loader
    //container - parent container of form
    //page - whole page
    export let size = "container";

    export let title = "Waiting...";
</script>

{#if size !== "hidden"}
    <div
        class="{size === 'page' ? 'pageloader' : 'containerloader'} {loading
            ? 'is-active'
            : ''}"
    >
        <span class="title">{$LOCALE[title]}</span>
    </div>
{/if}
