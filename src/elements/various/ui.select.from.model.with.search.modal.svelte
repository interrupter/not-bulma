<script>
    import notCommon from "../../frame/common";

    import { UIButtons } from "../button";

    import { createEventDispatcher, onMount } from "svelte";
    let dispatch = createEventDispatcher();

    export let value;
    export let inputStarted = false;

    export let icon = false;
    /**
     * @property {string}   fieldname
     */
    export let fieldname = "";

    /**
     * @property {boolean}   [readonly = false]
     */
    export let readonly = false;
    /**
     * Set this, as ns[ModelName], should be registered in notApp
     * @property {string}   serviceName     name of app service that will be used to search data
     */
    export let serviceName = "";
    /**
     * Set this
     * @property {string}   serviceOpenSelectorMethod    method of service to open modal with selector
     */
    export let serviceOpenSelectorMethod = "openSelector";
    /**
     * Set this
     * @property {string}   serviceLoadDataMethod    method of service to load model data by _id
     */
    export let serviceLoadDataMethod = "loadData";
    export let modelData = null;
    export let loading = false;
    export let selectedModelTitleFormatter = (data) => `${data._id}`;

    export let loadingLabel = "not-node:loading_label";
    export let isEmptyLabel = "not-node:field_value_is_empty_placeholder";

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

    let VISIBLE_BUTTONS = [];
    $: {
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
    }
</script>

<div class="control">
    <UIButtons values={VISIBLE_BUTTONS}></UIButtons>
</div>
