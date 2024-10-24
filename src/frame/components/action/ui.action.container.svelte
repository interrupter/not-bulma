<script>

  import {
    LOCALE
  } from '../../../locale';

  import UILoader from '../../../elements/various/ui.loader.svelte';
  import UIContainer from '../../../elements/layout/ui.container.svelte';
  import UINotificationError from '../../../elements/notification/ui.error.svelte';
  import UINotificationSuccess from '../../../elements/notification/ui.success.svelte';


  
	//hidden - no loader
	//container - parent container of form
	

	let success = $state(false);

  let error = $state(false);
  /**
   * @typedef {Object} Props
   * @property {any} [container]
   * @property {string} [loaderTitle]
   * @property {boolean} [loaderActive] - state if form loading
   * @property {string} [loaderSize] - page - whole page
   * @property {string} [successTitle]
   * @property {string} [successMessage]
   * @property {string} [errorTitle]
   * @property {string} [errorMessage]
   */

  /** @type {Props} */
  let {
    container = {},
    loaderTitle = $bindable('Отправка данных на сервер'),
    loaderActive = $bindable(false),
    loaderSize = $bindable('container'),
    successTitle = $bindable('OK'),
    successMessage = $bindable(''),
    errorTitle = $bindable('Error'),
    errorMessage = $bindable('')
  } = $props();

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
