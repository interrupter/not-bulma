<script>
    let { class: classes = "", children, ...other } = $props();
</script>

<a class={"navbar-item " + classes} {...other}
    >{#if other.title}{other.title}{:else}
        {@render children?.()}
    {/if}
</a>
