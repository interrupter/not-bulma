<script>
  import {
    onMount
  } from 'svelte';

  import UIContainer from '../layout/ui.container.svelte';
  import UIBox from '../ui.box.svelte';

  import UIForm from '../form/form.svelte';
  import Form from '../form.js';
  import Validators from './validators.js';

  import UIButton from '../ui.button.svelte';
  import AutoComplete from "simple-svelte-autocomplete";

  export let show = false;

  export let getAutocompleteUrl = (type, keyword) =>{
    return '/data/filter.json?format=json&name=' + encodeURIComponent(keyword)+'&type=' + encodeURIComponent(type);
  };

  let form;

  export let fetchListOfCompletions = async(type, keyword)=>{
    keyword.trim();
    if (keyword.length > 2) {
      const url = getAutocompleteUrl(type, keyword);
      const response = await fetch(url);
      const json = await response.json();
      if( json && json.status==='ok' && json.result){
        return json.result.map((itm) => {
          return {
            _id: itm._id,
            title: itm.title
          }
        });
      }
      return [];
    }
  };

  const fields = {
    term: {
      component: 'UITextfield',
      label: '',
      placeholder: 'что, где, когда?',
      icon: 'search'
    },
    type: {
      component: 'UICheckboxList',
      label: 'Тип',
      value: [{
          id: 1,
          value: true,
          label: 'Артист',
        },
        {
          id: 2,
          value: true,
          label: 'Картина',
        },
        {
          id: 3,
          value: true,
          label: 'Категория',
        },
        {
          id: 4,
          value: true,
          label: 'Коллекция',
        },
      ]
    },
    genre: {
      component: 'UIAutocomplete',
      label: 'Жанр',
      value: undefined,
      searchFunction(keyword) {
        return fetchListOfCompletions('genre', keyword);
      }
    },
    media: {
      component: 'UIAutocomplete',
      label: 'Материал',
      value: undefined,
      searchFunction(keyword) {
        return fetchListOfCompletions('media', keyword);
      }
    },
    imagining: {
      component: 'UIAutocomplete',
      label: 'Изображает',
      value: undefined,
      searchFunction(keyword) {
        return fetchListOfCompletions('imagining', keyword);
      }
    },
    storedIn: {
      component: 'UIAutocomplete',
      label: 'Хранится в',
      value: undefined,
      searchFunction(keyword) {
        return fetchListOfCompletions('storedIn', keyword);
      }
    },
    locatedIn: {
      component: 'UIAutocomplete',
      label: 'Находится в',
      value: undefined,
      searchFunction(keyword) {
        return fetchListOfCompletions('locatedIn', keyword);
      }
    }
  };

  const manifest = {
    model: 'search',
    url: '/api/:modelName',
    fields,
    actions: {
      search: {
        method: 'post',
        title: 'Поиск',
        description: ' ',
        fields: [
          'term',
          'type',
          'genre',
          'media',
          'imagining',
          'storedIn',
          'locatedIn'
        ]
      }
    }
  };


  let props = false;

  onMount(() => {
    props = Form.prebuild({
      manifest,
      action: 'search',
      validators: Validators
    });

  });

  function toggleForm() {
    show = !show;
    if (form) {
      form.$set({
        loading: false
      });
    }
  }

  let buttons = {
    cancel:{
      caption: 'Скрыть',
  		enabled: true
    },
    submit:{
      caption: 'Искать',
  		enabled: true
    },
  };
</script>

<UIContainer id='search-filter'>
    {#if show}
    {#if props}
    <UIForm bind:this={form} cancel={buttons.cancel} submit={buttons.submit} {...props} on:submit on:reject={toggleForm} on:change />
    {/if}
    {:else}
    <UIButton title='Поиск' icon='search' size='large' classes=" is-fullwidth " action={toggleForm} />
    {/if}
</UIContainer>
