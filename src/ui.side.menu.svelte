<script>
	export let title = 'Side menu';
	export let root = '';
	export let items = [];
	export let go = null;

	function onClick(ev) {
		if (typeof go === 'function') {
			ev.preventDefault();
			go(ev.currentTarget.dataset.href);
			return false;
		} else {
			return true;
		}
	}
</script>


<aside class="menu">
	<p class="menu-label">{title}</p>
	<ul class="menu-list">
		{#each items as link}
		{#if link.items && link.items.length }
		<li>
			{#if link.url }
			<a href="{root}{link.url}" data-href="{link.url}" on:click="{onClick}">{link.title}</a>
			{:else}
			<a>{link.title}</a>
			{/if}
			<ul class="menu-list">
				{#each link.items as subLink}
				<li><a href="{root}{subLink.url}" data-href="{subLink.url}" on:click="{onClick}">{subLink.title}</a></li>
				{/each}
			</ul>
		</li>
		{:else}
		{#if link.url }
		<li><a href="{root}{link.url}" data-href="{link.url}" on:click="{onClick}">{link.title}</a></li>
		{:else }
		<li><a>{link.title}</a></li>
		{/if}
		{/if}
		{/each}
	</ul>
</aside>
