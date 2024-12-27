<script>
    import UIBox from "../../block/ui.box.svelte";

    let { title, id, _id, onclick } = $props();

    function click(e) {
        e.preventDefault();
        onclick({
            _id,
            id,
            title,
        });
        return false;
    }
</script>

<UIBox onclick={click} onkeyup={click} class="list-item-selectable">
    <span>{title}</span>
</UIBox>
