<script>
  import {LOCALE} from './locale';
  export let title = '';
  export let subtitle;
  export let size = 1;
  export let subsize;
  export let spaced = false;

  let size2;
  $: size2 = subsize?subsize:(size<6?size+1:size);
  $: spacedStyle = (spaced?'is-spaced':'');

  $: resultTitle = `<h${size} class="title ${spacedStyle} is-${size}">${$LOCALE[title]}</h${size}>`;
  $: resultSubtitle = `<h${size2} class="subtitle is-${size2}">${$LOCALE[subtitle]}</h${size2}>`;

</script>

{@html resultTitle }

{#if subtitle }
{@html resultSubtitle }
{/if}
