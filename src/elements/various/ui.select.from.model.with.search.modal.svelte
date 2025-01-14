<script>
    import notCommon from "../../frame/common";

    import UIButtons from "../button/ui.buttons.svelte";
    import UIControl from "../input/ui.control.svelte";

    import { onMount } from "svelte";

    const DEFAULT_SERVICE_GETTER = (serviceName) => {
        if (!serviceName) throw new Error("serviceName is not set");
        return notCommon.getApp().getService(serviceName);
    };

    /**
     * @typedef {Object} Props
     * @property {string|number}   value
     * @property {string}   [icon = '']
     * @property {string}   [fieldname = '']
     * @property {boolean}  [readonly = false]
     * @property {string}   [serviceName = ''] - Set this, as ns[ModelName], should be registered in notApp
     * @property {string}   [serviceOpenSelectorMethod = "openSelector"] - Set this
     * @property {string}   [serviceLoadDataMethod = "loadData"] - Set this
     * @property {object}   [modelData = null]
     * @property {boolean}  [loading = false]
     * @property {function} [selectedModelTitleFormatter = (data) => data._id]
     * @property {function} [serviceGetter = (serviceName)=>notCommon.getApp().getService(serviceName)]
     * @property {string}   [loadingLabel = "not-node:loading_label"]
     * @property {string}   [isEmptyLabel = "not-node:field_value_is_empty_placeholder"]
     * @property {function} [onchange = () => true]
     * @property {object}   [openSelectorButtonProps = {}]
     * @property {object}   [resetButtonProps = {}]
     * @property {object}   [emptyButtonProps = {}]
     * @property {object}   [valueButtonProps = {}]
     */

    /** @type {Props} */
    let {
        value = $bindable(),
        icon = "search",
        fieldname = "",
        readonly = false,
        serviceName = "",
        serviceOpenSelectorMethod = "openSelector",
        serviceLoadDataMethod = "loadData",
        modelData = $bindable(null),
        loading = $bindable(false),
        selectedModelTitleFormatter = (data) => `${data._id}`,
        serviceGetter = DEFAULT_SERVICE_GETTER,
        loadingLabel = "not-node:loading_label",
        isEmptyLabel = "not-node:field_value_is_empty_placeholder",
        onchange = () => true,
        openSelectorButtonProps = {},
        resetButtonProps = {},
        emptyButtonProps = {},
        valueButtonProps = {},
    } = $props();

    function openModelSearchAndSelect() {
        if (!serviceOpenSelectorMethod) {
            throw new Error("serviceOpenSelectorMethod is not set");
        }
        const service = serviceGetter(serviceName);
        service[serviceOpenSelectorMethod]()
            .then((result) => {
                value = result._id;
                modelData = result;
                return value;
            })
            .then((value) => {
                onchange({
                    field: fieldname,
                    value,
                    data: modelData,
                });
            })
            .catch((e) => {
                notCommon.report(e);
            });
    }

    function resetSelectedModel() {
        value = undefined;
        modelData = null;
        onchange({
            field: fieldname,
            value,
        });
    }

    async function loadModelData() {
        try {
            if (!modelData && value) {
                loading = true;
                modelData = await getService()[serviceLoadDataMethod](value);
            }
        } catch (e) {
            notCommon.report(e);
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        loadModelData();
    });

    const AVAILABLE_BUTTONS = [
        {
            id: 1,
            action: openModelSearchAndSelect,
            icon,
            color: "warning",
            ...openSelectorButtonProps,
        },
        {
            id: 2,
            action: resetSelectedModel,
            icon: "times",
            color: "danger",
            ...resetButtonProps,
        },
    ];

    function getModelButton() {
        if (loading) {
            return {
                disabled: true,
                loading,
                title: loadingLabel,
            };
        } else {
            if (modelData) {
                return {
                    disabled: readonly,
                    action: openModelSearchAndSelect,
                    title: selectedModelTitleFormatter(modelData),
                    ...valueButtonProps,
                };
            } else {
                return {
                    disabled: true,
                    title: isEmptyLabel,
                    ...emptyButtonProps,
                };
            }
        }
    }

    let VISIBLE_BUTTONS = $state([]);

    $effect(() => {
        if (value) {
            VISIBLE_BUTTONS = [
                getModelButton(),
                ...(readonly ? [] : AVAILABLE_BUTTONS),
            ];
        } else {
            VISIBLE_BUTTONS = [
                getModelButton(),
                ...(readonly ? [] : [AVAILABLE_BUTTONS[0]]),
            ];
        }
    });
</script>

<UIControl>
    <UIButtons values={VISIBLE_BUTTONS} class={"is-no-flex-wrap"}></UIButtons>
</UIControl>
