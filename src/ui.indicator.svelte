<script>
  import {onMount} from 'svelte';
  import {notCommon} from './frame';
  //if we want to address this indicator
  export let id = 'tagId';

  export let state = 'light';
  export let size = 'normal';
  export let labels = {
    black: 'black',
    dark: 'dark',
    light: 'light',
    white: 'white',
    primary: 'primary',
    link: 'link',
    info: 'info',
    success: 'success',
    warning: 'warning',
    danger: 'danger'
  };
  export let classes = 'mx-1';

  export let padding = 'normal';
  export let bold = false;

  export let right = false;
  export let left = false;
  export let top = false;
  export let bottom = false;

  let sided = false;
  $: sided = right || left || top || bottom;


  export let events = {};        //events to react on
  //register event handlers
  export let register = notCommon.registerWidgetEvents.bind(notCommon);
  //
  export let onUpdate = (data)=>{
    if (Object.prototype.hasOwnProperty.call(data, 'state')){
      state = data.state;
    }
  };

  function getStandartUpdateEventName(){
    return `indicator-${id}:update`;
  }

  onMount(()=>{
    if (!Object.prototype.hasOwnProperty(events, getStandartUpdateEventName())){
      events[getStandartUpdateEventName()] = onUpdate;
    }
    register(events);
  });
</script>

<span class="tag
is-{size}
{bold?'has-text-weight-bold':''}
{padding!=='normal'?`is-padded-${padding}`:''}
{sided?'is-sided':''}
{right?'is-sided-right':''}
{left?'is-sided-left':''}
{top?'is-sided-top':''}
{bottom?'is-sided-bottom':''}
  is-{state} {classes}
  ">{labels[state]}</span>
