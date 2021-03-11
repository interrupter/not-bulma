<script>
  import {
    createEventDispatcher
  } from 'svelte';
  const dispatch = createEventDispatcher();

  import UINavbarItem from './ui.navbar.item.svelte';
  import UINavbarBurger from './ui.navbar.burger.svelte';
  import {
    beforeUpdate
  } from 'svelte';

  export let sections = [];
  export let items = [];
  export let root = '';
  export let navigate = null;
  export let brand = false;
  export let showBurger = true;

  function onClick(ev, element) {
    if (Object.prototype.hasOwnProperty.call(element, 'action')) {
      return element.action(ev, element);
    }
    ev.preventDefault();
    if (typeof navigate === 'function') {
      navigate({
        full: ev.target.getAttribute('href'),
        short: ev.target.dataset.href
      });
    }
    return false;
  }

  let sectionsItemsCount = {};

  beforeUpdate(() => {
    for (let section of sections) {
      sectionsItemsCount[section.id] = items.filter(t => t.section === section.id).length;
    }
  });


  function toggleBurger({
    detail
  }) {
    dispatch('toggleBurger', detail);
  }
</script>


<div class="navbar-brand">
  {#if brand }
  <a class="navbar-item" href="{brand.url}">
    <img src="{brand.icon.src}" width="{brand.icon.width}" height="{brand.icon.height}" />
  </a>
  {/if}
  {#each items as item(item.id)}
  {#if item.showOnTouch}
  <UINavbarItem hide="desktop" {item} />
  {/if}
  {/each}
  {#if showBurger}
  <UINavbarBurger on:toggle={toggleBurger} />
  {/if}
  <div id="navbar" class="navbar-menu">
    <div class="navbar-start">
      {#each items as item}
      {#if item.place === 'main' }
      <UINavbarItem hide="touch" {item} />
      {/if}
      {/each}
    </div>
    <div class="navbar-end">
      {#each sections as section(section.id) }
      {#if sectionsItemsCount[section.id] || section.indicator || section.tag }
      <div class="navbar-item {sectionsItemsCount[section.id]?'has-dropdown':''} is-hoverable is-pulled-right">
        <a href class="navbar-link {sectionsItemsCount[section.id]?'':'is-arrowless'}" on:click="{(e)=>{onClick(e, section);}}">
          {section.title}
          {#if section.tag }
          <span class="ml-3 tag is-{section.tag.type} is-pulled-right">{section.tag.label}</span>
          {/if}
          {#if section.indicator }
          <UIIndicator {...(section.indicator)} />
          {/if}
        </a>
        {#if items.filter(t => t.section === section.id).length }
        <div class="navbar-dropdown">
          {#each items as item(item.id)}
          {#if section.id === item.section }
          {#if item.break }
          <hr class="navbar-divider" />
          {/if}
          <a class="navbar-item" href="{root}{item.url}" data-href="{item.url}" on:click="{(e)=>{onClick(e, item);}}">{item.title}
            {#if item.tag }
            <span class="ml-3 tag is-{item.tag.type} is-pulled-right">{item.tag.label}</span>
            {/if}
            {#if item.indicator }
            <UIIndicator {...(item.indicator)} />
            {/if}
          </a>
          {/if}
          {/each}
        </div>
        {/if}
      </div>
      {/if}
      {/each}
    </div>
  </div>
</div>
