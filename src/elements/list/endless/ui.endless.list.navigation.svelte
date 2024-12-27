<script>
    import UIButton from "../../button/ui.button.svelte";

    /**
     * @typedef {Object} Props
     * @property {number} [page] - export let count = 0;
     * @property {number} [pages]
     * @property {any} [buttonComponent = UIButton]
     * @property {any} [buttonComponentProps]
     * @property {function} [onnext]
     * @property {function} [onprev]
     */

    /** @type {Props} */
    let {
        page = 0,
        pages = 0,
        buttonComponent: UIButtonComponent = UIButton,
        buttonComponentProps = {},
        onprev = () => {},
        onnext = () => {},
    } = $props();
</script>

{#if pages > 0}
    <div class="columns">
        <div class="column">
            {#if page > 1}
                <UIButtonComponent
                    {...buttonComponentProps}
                    action={onprev}
                    title={"not-node:list_navigation_prev_button_label"}
                />
            {/if}
        </div>
        {#if pages > 1}
            <div class="column box">
                {page} / {pages}
            </div>
        {/if}
        <div class="column">
            {#if page < pages}
                <UIButtonComponent
                    {...buttonComponentProps}
                    action={onnext}
                    title={"not-node:list_navigation_next_button_label"}
                />
            {/if}
        </div>
    </div>
{/if}
