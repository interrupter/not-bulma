<script>
  import {onMount} from 'svelte';
  import {LOCALE} from '../../locale';
  export let show = false;
  export let message = 'Для улучшения работы сайта и его взаимодействия с пользователями мы используем файлы cookie. Продолжая работу с сайтом, Вы разрешаете использование cookie-файлов. Вы всегда можете отключить файлы cookie в настройках Вашего браузера.';
  export let agree = 'Хорошо';

  onMount(()=>{
    let cookieDate = localStorage.getItem('cookie_date');
    if( !cookieDate || (+cookieDate + 31536000000) < Date.now() ){
      show = true;
    }
  });

  function accept(){
    localStorage.setItem('cookie_date', Date.now());
    show = false;
  }
</script>

{#if show}
<div id="cookie_notification">
  <p>{$LOCALE[message]}</p>
  <button class="button is-success cookie_accept" on:click={accept}>{$LOCALE[agree]}</button>
</div>
{/if}

<style>
  #cookie_notification{
    display: block;
    text-align: left;
    justify-content: space-between;
    align-items: flex-end;
    position: fixed;
    bottom: 15px;
    left: 50%;
    width: 900px;
    max-width: 90%;
    transform: translateX(-50%);
    padding: 25px;
    background-color: white;
    border-radius: 4px;
    box-shadow: 2px 3px 10px rgba(0, 0, 0, 0.4);
  }

  #cookie_notification p{
    margin: 0;
    font-size: 0.7rem;
    text-align: left;
    color: #3d3d3d;
  }

  @media (min-width: 576px){
    #cookie_notification{
      display: flex;
    }
    .cookie_accept{
      margin: 0 0 0 25px;
    }
  }

  @media (max-width: 575px){
    #cookie_notification{
      text-align: left;
    }
    .cookie_accept{
      margin: 10px 0 0 0;
    }
  }

</style>
