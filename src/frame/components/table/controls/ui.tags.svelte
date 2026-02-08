<script>
    /**
   * @typedef {Object} Props
   * @property {any} [values] - item = {
id,        //unique
title,     //some text
value,      //for double tags
color       //coloring
}
   */

    /** @type {Props} */
    let { values = [] } = $props();
</script>

{#each values as item (item.id)}
    {#if Object.hasOwn(item, "value")}
        <div class="mx-1 tags has-addons">
            <span class="tag">{item.title}</span>
            <span class="tag is-{item.color} {item.customClasses}">
                {#if item.href}
                    <a href={item.href} class={item.urlCustomClasses}
                        >{item.value}</a
                    >
                {:else}
                    {item.value}
                {/if}
            </span>
        </div>
    {:else}
        <span class="mx-1 tag is-{item.color} {item.customClasses}">
            {#if item.href}
                <a href={item.href} class={item.urlCustomClasses}
                    >{item.title}</a
                >
            {:else}
                {item.title}
            {/if}
        </span>
    {/if}
{/each}

<style>
    .tags:not(:last-child) {
        margin-bottom: none;
    }
</style>
