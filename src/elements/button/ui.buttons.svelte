<script>
    import UIButton from "./ui.button.svelte";

    /**
     * @typedef {Object} Props
     * @property {any} [values]
     * @property {boolean} [centered]
     * @property {boolean} [right]
     * @property {string} [classes]
     * @property {any} [buttonComponent]
     * @property {any} [action]
     */

    /** @type {Props} */
    let {
        values = [],
        centered = false,
        right = false,
        classes = "",
        buttonComponent = UIButton,
        action = () => {
            return true;
        },
        onclick = () => {
            return true;
        },
    } = $props();
</script>

<div
    class="buttons has-addons {centered ? 'is-centered' : ''} {right
        ? 'is-right'
        : ''} {classes}"
>
    {#each values as item (item.id)}
        {@const SvelteComponent = buttonComponent}
        <SvelteComponent {action} {onclick} {...item} bind:value={item.value} />
    {/each}
</div>
