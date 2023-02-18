<script>
    export let id = "";
    export let classes = "";
    export let widescreen = false;
    export let fullhd = false;
    export let maxDesktop = false;
    export let maxWidescreen = false;
    export let fluid = false;
</script>

<div
    {id}
    class="container {classes}"
    class:is-widescreen={widescreen}
    class:is-fullhd={fullhd}
    class:is-max-desktop={maxDesktop}
    class:is-max-widescreen={maxWidescreen}
    class:is-fluid={fluid}
    on:click
>
    <slot />
</div>
