const { SideMenu, TopMenu } = notBulma;

import menu from './menu.js';

function initMenu() {
  notBulma.Frame.COMPONENTS.add(notBulma.UIProgress);
  SideMenu.setOptions({
    items: menu.side.items ? menu.side.items : [],
    sections: menu.side.sections ? menu.side.sections : []
  });
  SideMenu.render();
  TopMenu.setOptions({
    root: 'http://' + window.location.host,
    brand: {
      url: './index.html',
      icon: {
        src: '/img/icon/logo/icon-32.png',
        width: 32,
        height: 32
      }
    },
    items: menu.top.items ? menu.top.items : [],
    sections: menu.top.sections ? menu.top.sections : []
  });
  TopMenu.render();
}

function initExamplesSetHTML(id, val) {
  let cont = document.querySelector('#examples');
  let box = document.createElement('div');
  box.classList.add('box');
  box.id = 'examples-set-' + id;
  cont.appendChild(box);
  let title = document.createElement('h3');
  title.classList.add('title');
  title.classList.add('is-4');
  title.classList.add('is-4');
  title.innerHTML = val.title;
  box.appendChild(title);
  let description = document.createElement('div');
  description.classList.add('content');
  description.innerHTML = val.description;
  box.appendChild(description);
  let cols = document.createElement('div');
  cols.classList.add('columns');
  box.appendChild(cols);
  let elements = document.createElement('div');
  elements.classList.add('column');
  cols.appendChild(elements);
  let pre = document.createElement('pre');
  pre.classList.add('column');
  pre.innerHTML = JSON.stringify(val.props, null, 4);
  cols.appendChild(pre);
  val.props.forEach((props, i) => {
    let example = document.createElement('div');
    example.classList.add('column');
    example.id = `example-${id}-${i}`;
    elements.appendChild(example);
    new notBulma[window.EXAMPLES_SELECTED]({
      target: example,
      props
    });
  });
}

function initExamples() {
  if (window.EXAMPLES_SELECTED && Object.prototype.hasOwnProperty.call(window.EXAMPLES, window.EXAMPLES_SELECTED)) {
    const list = window.EXAMPLES[window.EXAMPLES_SELECTED];
    for (let set in list) {
      initExamplesSetHTML(set, list[set]);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log(menu);
  console.log(Object.keys(notBulma));
  initMenu();
  if (window.EXAMPLES) {
    console.log(window.EXAMPLES_SELECTED);
    console.log(Object.keys(window.EXAMPLES));
    initExamples();
  }
});