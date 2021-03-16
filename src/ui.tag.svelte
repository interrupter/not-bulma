<script>
  import {onMount} from 'svelte';
  import {notCommon} from './frame';
  //if we want to address this tag
  export let id = 'tagId';
  export let title = 'tag';
  export let color = 'info';
  export let size = 'normal';

  export let padding = 'normal';
  export let bold = false;

  export let right = false;
  export let left = false;
  export let top = false;
  export let bottom = false;

  export let classes = '';
  let sided = false;
  $: sided = right || left || top || bottom;

  export let events = {};        //events to react on
  //register event handlers
  export let register = notCommon.registerWidgetEvents;
  //
  export let onUpdate = (data)=>{
    if (Object.prototype.hasOwnProperty.call(data, 'title')){
      title = data.title;
    }
  };

  function getStandartUpdateEventName(){
    return `tag-${id}:update`;
  }

  onMount(()=>{
    if (!Object.prototype.hasOwnProperty(events, getStandartUpdateEventName())){
      events[getStandartUpdateEventName()] = onUpdate;
    }
    register(events);
  });

</script>

<span
  id="tag-{id}"
  class="
  tag
  {bold?'has-text-weight-bold':''}
  {padding!=='normal'?`is-padded-${padding}`:''}
  is-{size}
  is-{color}
  {sided?'is-sided':''}
  {right?'is-sided-right':''}
  {left?'is-sided-left':''}
  {top?'is-sided-top':''}
  {bottom?'is-sided-bottom':''}
  {classes}"
  >{title}</span>
