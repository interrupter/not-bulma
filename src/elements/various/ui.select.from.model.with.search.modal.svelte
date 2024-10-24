<script>
    import { run } from 'svelte/legacy';

    import notCommon from "../../frame/common";

    import { UIButtons } from "../button";

    import { createEventDispatcher, onMount } from "svelte";
    let dispatch = createEventDispatcher();


    

    
    
    
    

    /**
     * @typedef {Object} Props
     * @property {any} value
     * @property {boolean} [inputStarted]
     * @property {boolean} [icon]
     * @property {string} [fieldname]
     * @property {boolean} [readonly]
     * @property {string} [serviceName] - Set this, as ns[ModelName], should be registered in notApp
     * @property {string} [serviceOpenSelectorMethod] - Set this
     * @property {string} [serviceLoadDataMethod] - Set this
     * @property {any} [modelData]
     * @property {boolean} [loading]
     * @property {any} [selectedModelTitleFormatter]
     * @property {string} [loadingLabel]
     * @property {string} [isEmptyLabel]
     */

    /** @type {Props} */
    let {
        value = $bindable(),
        inputStarted = $bindable(false),
        icon = false,
        fieldname = "",
        readonly = false,
        serviceName = "",
        serviceOpenSelectorMethod = "openSelector",
        serviceLoadDataMethod = "loadData",
        modelData = $bindable(null),
        loading = $bindable(false),
        selectedModelTitleFormatter = (data) => `${data._id}`,
        loadingLabel = "not-node:loading_label",
        isEmptyLabel = "not-node:field_value_is_empty_placeholder"
    } = $props();

    function getService() {
        if (!serviceName) throw new Error("serviceName is not set");
        return notCommon.getApp().getService(serviceName);
    }

    function openModelSearchAndSelect() {
        if (!serviceOpenSelectorMethod) {
            throw new Error("serviceOpenSelectorMethod is not set");
        }
        getService()
            [serviceOpenSelectorMethod]()
            .then((results) => {
                value = results._id;
                modelData = results;
                return value;
            })
            .then((value) => {
                inputStarted = true;
                dispatch("change", {
                    field: fieldname,
                    value,
                });
            })
            .catch((e) => {
                notCommon.report(e);
            });
    }

    function resetSelectedModel() {
        value = undefined;
        modelData = null;
        dispatch("change", {
            field: fieldname,
            value,
        });
    }

    async function loadModelData() {
        try {
            if (value) {
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
        },
        {
            id: 2,
            action: resetSelectedModel,
            icon: "times",
            color: "danger",
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
                };
            } else {
                return {
                    disabled: true,
                    title: isEmptyLabel,
                };
            }
        }
    }

    let VISIBLE_BUTTONS = $state([]);
    run(() => {
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

<div class="control">
    <UIButtons values={VISIBLE_BUTTONS} classes={"is-no-flex-wrap"}></UIButtons>
</div>
