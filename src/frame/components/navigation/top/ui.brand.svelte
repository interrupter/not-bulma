<script>
    import UIIcon from "../../../../elements/icon/ui.icon.svelte";
    export let url = "/";
    export let title = "";
    export let icon = {
        src: "https://via.placeholder.com/56x28",
        width: 28,
        height: 56,
    };
</script>

<a class="navbar-item" href={url}>
    <UIIcon {...icon} />
    {#if title}
        {@html `<span class="navbar-item-brand-title">${title}</span>`}
    {/if}
</a>
