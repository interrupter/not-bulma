<script>
    import { LOCALE } from "../../locale";
    import UIButtons from "../button/ui.buttons.svelte";
    import UIOverlay from "./ui.overlay.svelte";

    import { UIEndlessList } from "../list/endless";
    import UISimpleSearchInput from "../various/ui.simple.search.input.svelte";

    /**
     * @typedef {Object} Props
     * @property {boolean} [show]
     * @property {string} [term]
     * @property {string} [size]
     * @property {any} [inputComponent]
     * @property {any} [inputComponentProps]
     * @property {any} [outputComponent]
     * @property {any} [outputComponentProps]
     * @property {any} [results]
     */

    /** @type {Props} */
    let {
        show = true,
        term = $bindable(""),
        size = "narrow",
        inputComponent: UIInputComponent = UISimpleSearchInput,
        inputComponentProps = {},
        outputComponent: UIOutputComponent = UIEndlessList,
        outputComponentProps = {},
        results = $bindable({ list: [], page: 0, pages: 0, skip: 0, count: 0 }),
        ontermChange,
        onprev,
        onnext,
        onresolve,
    } = $props();

    const buttons = [
        {
            title: $LOCALE["not-node:button_cancel_label"],
            action: () => onreject(),
        },
    ];
</script>

<UIOverlay
    onreject={overlayClosed}
    {show}
    closeOnClick={true}
    closeButton={false}
>
    <div class="paper box block {size}">
        <UIInputComponent {ontermChange} bind:term {...inputComponentProps} />
        <UIOutputComponent
            bind:data={results}
            {onprev}
            {onnext}
            {onresolve}
            {...outputComponentProps}
        />
        <UIButtons values={buttons} centered={true} class="mt-5" />
    </div>
</UIOverlay>

<style>
</style>
