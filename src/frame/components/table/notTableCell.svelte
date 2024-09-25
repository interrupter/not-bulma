<script>
    import notPath from "not-path";
    import { onMount } from "svelte";

    let title = "";

    onMount(() => {
        if (typeof field.type === "undefined") {
            if (Object.hasOwn(field, "titlePath")) {
                title = notPath.get(field.titlePath, item, helpers);
            } else if (
                Object.hasOwn(field, "titleComposer") &&
                typeof field.titleComposer === "function"
            ) {
                title = field.titleComposer(item, helpers);
            } else {
                title = notPath.get(field.path, item, helpers);
            }
        }
    });

    import notCommon from "../../common";

    import { LOCALE } from "../../../locale";

    import UIButtons from "../../../elements/button/ui.buttons.svelte";
    import UILinks from "../../../elements/link/ui.links.svelte";
    import UIImages from "../../../elements/image/ui.images.svelte";
    import UIBooleans from "../../../elements/various/ui.booleans.svelte";

    import TableSwitch from "./controls/ui.switch.svelte";
    import TableTags from "./controls/ui.tags.svelte";

    export let getItemId = (item) => item._id;
    export let field = {};
    export let item = {};
    export let helpers = {};
</script>

<td
    class={(field.hideOnMobile ? " is-hidden-touch " : "") +
        (field.classes ? ` ${field.classes} ` : "")}
    {title}
>
    {#if field.type === "link"}
        <UILinks values={notPath.get(field.path, item, helpers)} />
    {:else if field.type === "button"}
        <UIButtons values={notPath.get(field.path, item, helpers)} />
    {:else if field.type === "image"}
        <UIImages values={notPath.get(field.path, item, helpers)} />
    {:else if field.type === "boolean"}
        <UIBooleans values={notPath.get(field.path, item, helpers)} />
    {:else if field.type === "tag"}
        <TableTags values={notPath.get(field.path, item, helpers)} />
    {:else if field.type === "switch"}
        <TableSwitch
            id={getItemId(item)}
            fieldname={field.path}
            on:change={field.onChange}
            value={notPath.get(field.path, item, helpers)}
            disabled={field.disabled}
            readonly={field.readonly}
        />
    {:else if field.component}
        <svelte:component
            this={field.component}
            id={getItemId(item)}
            on:change={field.onChange}
            fieldname={field.path}
            disabled={field.disabled}
            readonly={field.readonly}
            value={notPath.get(field.path, item, helpers)}
            {...field.options}
        />
    {:else if field && typeof field !== "undefined" && !isNaN(field.maxLength) && field.maxLength}
        {notCommon.strLengthCap(
            notPath.get(field.path, item, helpers),
            field.maxLength
        )}
    {:else}
        {$LOCALE[notPath.get(field.path, item, helpers)]}
    {/if}
</td>
