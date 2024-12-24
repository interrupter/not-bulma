<script>
    import ErrorsList from "../various/ui.errors.list.svelte";

    let {
        id = "generic-field",
        inputStarted,
        validated,
        valid,
        errors,
        formErrors,
        class: classes = "",
    } = $props();

    let allErrors = $state([]);
    let showErrors = $state(true);

    $effect(() => {
        allErrors = [
            ...(Array.isArray(errors) ? errors : []),
            ...(Array.isArray(formErrors) ? formErrors : []),
        ];
        showErrors = inputStarted && validated && !valid;
    });
</script>

<ErrorsList show={showErrors} errors={allErrors} class={classes} {id} />
