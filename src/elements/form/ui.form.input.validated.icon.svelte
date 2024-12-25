<script>
    import { UIIconFont } from "../icon";

    let { validated, valid, side = "right", size = "small" } = $props();
</script>

{#if validated === true}
    <UIIconFont font={valid ? "check" : "exclamation-triangle"} {side} {size} />
{/if}
