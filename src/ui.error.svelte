<script>
  import {LOCALE} from './locale';
  
  export let message;
  export let title;

</script>

<article class="message is-danger">
  <div class="message-header">
    <p>{$LOCALE[title]}</p>
  </div>
  <div class="message-body">
    {$LOCALE[message]}
  </div>
</article>
