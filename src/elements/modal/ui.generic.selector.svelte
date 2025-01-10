<script>
    import { LOCALE } from "../../locale";
    import UIButtons from "../button/ui.buttons.svelte";
    import UIOverlay from "./ui.overlay.svelte";

    import { UIEndlessList } from "../list/endless";
    import UISimpleSearchInput from "../various/ui.simple.search.input.svelte";
    import { UIBox, UIBlock } from "../block";

    /**
     * @typedef {Object} Props
     * @property {boolean} [show]
     * @property {boolean}  [showSearch = true]
     * @property {string} [term]
     * @property {(fullscreen|wide|normal|narrow)} [size]   100vw, 75vw, 50vw, 25vw
     * @property {any} [inputComponent]
     * @property {object} [inputComponentProps]
     * @property {any} [outputComponent]
     * @property {object} [outputComponentProps]
     * @property {object}   [buttonsProps = { centered: true, class: "mt-5",}]
     * @property {object} [results]
     * @property    {function}  onprev
     * @property    {function}  onnext
     * @property    {function}  onchange
     * @property    {function}  onreject
     * @property    {function}  onresolve
     */

    /** @type {Props} */
    let {
        show = true,
        showSearch = true,
        term = $bindable(""),
        size = "narrow",
        inputComponent: UIInputComponent = UISimpleSearchInput,
        inputComponentProps = {},
        outputComponent: UIOutputComponent = UIEndlessList,
        outputComponentProps = {},
        buttonsProps = {
            centered: true,
            class: "mt-5",
        },
        rejectButtonProps = {},
        results = $bindable({ list: [], page: 0, pages: 0, skip: 0, count: 0 }),
        onchange,
        onprev,
        onnext,
        onresolve,
        onreject,
    } = $props();

    const buttons = [
        {
            title: $LOCALE["not-node:button_cancel_label"],
            action: onreject,
            ...rejectButtonProps,
        },
    ];
</script>

<UIOverlay {onreject} {show} closeOnClick={true} closeButton={false}>
    <UIBox class="modal-selector {size}">
        {#if showSearch}
            <UIInputComponent {onchange} bind:term {...inputComponentProps} />
        {/if}

        <UIOutputComponent
            bind:data={results}
            {onprev}
            {onnext}
            onselect={onresolve}
            class="has-height-up-to-60 overflow-scroll"
            {...outputComponentProps}
        />

        <UIButtons {...buttonsProps} values={buttons} />
    </UIBox>
</UIOverlay>
