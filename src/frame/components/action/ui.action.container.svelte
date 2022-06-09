<script>

  import {
    LOCALE
  } from '../../../locale';

  import UILoader from '../../../elements/various/ui.loader.svelte';
  import UIContainer from '../../../elements/layout/ui.container.svelte';
  import UINotificationError from '../../../elements/notification/ui.error.svelte';
  import UINotificationSuccess from '../../../elements/notification/ui.success.svelte';

  export let container = {};

	export let loaderTitle = 'Отправка данных на сервер';
  //state if form loading
	export let loaderActive = false;
	//hidden - no loader
	//container - parent container of form
	//page - whole page
	export let loaderSize = 'container';

	let success = false;
  export let successTitle = 'OK';
  export let successMessage = '';

  let error = false;
  export let errorTitle = 'Error';
  export let errorMessage = '';

  export function showSuccess(title, message) {
    error = false;
    success = true;
    if(message != undefined){
      successMessage = message;
    }
    if(title != undefined){
      successTitle = title;
    }
  }

  export function showError(title, message) {
    success = false;
    error = true;
    if(message != undefined){
      messageTitle = message;
    }
    if(title != undefined){
      successTitle = title;
    }
  }

  export function setLoading() {
    loaderActive = true;
    success = false;
    error = false;

  }

  export function resetLoading() {
    loaderActive = false;
  }

  export function hideAll(){
    loaderActive = false;
    success = false;
    error = false;
  }

</script>


<UILoader
  bind:loading={loaderActive}
  bind:title={loaderTitle}
  bind:size={loaderSize}
  />
<UIContainer {...container} >
  {#if error }
  <UINotificationError bind:title={errorTitle} bind:message={errorMessage} />
  {/if}
  {#if success}
  <UINotificationSuccess bind:title={successTitle} bind:message={successMessage} />
  {/if}
</UIContainer>
