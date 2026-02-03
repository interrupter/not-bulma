<script>
    import "bulma-pageloader";
    import { LOCALE } from "../../locale";
    
    //hidden - no loader
    //container - parent container of form
    

    /**
     * @typedef {Object} Props
     * @property {boolean} [loading] - state if form loading
     * @property {string} [size] - page - whole page
     * @property {string} [title]
     */

    /** @type {Props} */
    let { loading = false, size = "container", title = "Waiting..." } = $props();
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
