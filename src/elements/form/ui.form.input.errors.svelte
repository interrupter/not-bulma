<script>
    import ErrorsList from "../various/ui.errors.list.svelte";

    let {
        id = "generic-field",
        inputStarted,
        validated,
        valid,
        errors,
        formErrors,
    } = $props();

    let allErrors = $state([]);
    let showErrors = $state(true);
    let validationClasses = $state("");

    $effect.pre(() => {
        allErrors = [].concat(
            errors ? errors : [],
            formErrors ? formErrors : []
        );
        showErrors = !(validated && valid) && inputStarted;
    });
</script>

<ErrorsList
    show={showErrors}
    errors={allErrors}
    classes={validationClasses}
    {id}
/>
