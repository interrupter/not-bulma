<script>
    import UIButton from "./ui.button.svelte";

    /**
     * @typedef {Object} Props
     * @property {Array<object>} [values = []]
     * @property {boolean} [centered = false]
     * @property {boolean} [right = false]
     * @property {string} [class = '']
     * @property {import('svelte').Component} [buttonComponent = UIButton]
     * @property {import('../events.types').UIEventInputChangeCallback} [action = ()=>true]
     * @property {import('../events.types').UIEventCallback} [onclick = ()=>true]
     */

    /** @type {Props} */
    let {
        values = [],
        centered = false,
        right = false,
        class: classes = "",
        buttonComponent: SvelteComponent = UIButton,
        action = () => {
            return true;
        },
        onclick = () => {
            return true;
        },
    } = $props();

    let _values = $state([]);

    $effect(() => {
        _values = values.map((itm) => {
            if (isNaN(itm.id)) {
                itm.id = Math.round(Math.random() * 100);
            }
            return itm;
        });
    });
</script>

<div
    class="buttons has-addons {centered ? 'is-centered' : ''} {right
        ? 'is-right'
        : ''} {classes}"
>
    {#each _values as item (item.id)}
        <SvelteComponent {action} {onclick} {...item} bind:value={item.value} />
    {/each}
</div>
