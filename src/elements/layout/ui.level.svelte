<script>
    /**
     * @typedef {Object} Props
     * @property {import('svelte').Snippet} [left]
     * @property {import('svelte').Snippet} [right]
     */

    /** @type {Props} */
    let { left, right } = $props();
</script>

<nav class="level">
    <!-- Left side -->
    <div class="level-left">
        {@render left?.()}
    </div>

    <!-- Right side -->
    <div class="level-right">
        {@render right?.()}
    </div>
</nav>
