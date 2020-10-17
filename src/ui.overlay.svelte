<script>
	let overflowSave = '';

	import {
		fade
	} from 'svelte/transition';

	import {
		createEventDispatcher,
		onMount,
		onDestroy
	} from 'svelte';

	const dispatch = createEventDispatcher();

	export let closeButton = false;
	export let show = true;
	export let closeOnClick = true;
	export let closeSize = 'normal';
	//export let layer = 1;

	$: if(show){
		document.body.style.overflow = 'hidden';
	}else{
		document.body.style.overflow = overflowSave;
	}

	function overlayClick(e){
		if(closeOnClick){
			closeOverlay(e);
		}
	}

	function closeButtonClick(){
		rejectOverlay();
	}

	function closeOverlay(e) {
		if(e.originalTarget && e.originalTarget.classList.contains('is-overlay')){
			rejectOverlay();
		}
	}

	function rejectOverlay(data = {}) {
		dispatch('reject', data);
	}

	function resolveOverlay(data = {}) {
		dispatch('resolve', data);
	}

	onMount(() => {
		overflowSave = document.body.style.overflow;

	});

	onDestroy(() => {
		document.body.style.overflow = overflowSave;
	});
</script>

{#if show}
<div class="is-overlay not-overlay" transition:fade on:click={overlayClick}>
	{#if closeButton}
  <button on:click={closeButtonClick} class="delete is-{closeSize}"></button>
	{/if}
	<slot></slot>
</div>
{/if}

<style>
	.not-overlay {
		position: fixed;
		top: 0px;
		left: 0px;
		width: 100vw;
		height: 100vh;
		margin: 0px;
		display: block;
		opacity: 1;
		overflow: hidden;
	}


.stop-scrolling {
    height: 100%;
    overflow: hidden;
}

</style>
