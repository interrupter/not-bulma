<script>
  export let title = '';
  export let subtitle;
  export let size = 1;
  export let subsize;
  export let spaced = false;

  let size2;
  $: size2 = subsize?subsize:(size<6?size+1:size);
  $: spacedStyle = (spaced?'is-spaced':'');

</script>

{@html `<h${size} class="title ${spacedStyle}">${title}</h${size}>`}

{#if subtitle }
{@html `<h${size2} class="subtitle">${subtitle}</h${size2}>`}
{/if}
