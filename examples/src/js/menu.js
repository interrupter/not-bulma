const events = new EventEmitter();
function shuffle(array) {
  array.sort(() => Math.random() - 0.5);
}

function updateUserCard(){
  let roles = ['root', 'admin', 'manager', 'client', 'user', 'guest'];
  let usernames = ['Root', 'John Doe', 'Jack Smith', 'Ellen hunt', 'Nikita Belucci', 'Vernor von Braun'];
  shuffle(roles);
  shuffle(usernames);
  events.emit(`usercard-account:update`, {
    username: usernames[0],
    role: roles[0]
  });
}

function updateNotificationsTag(){
  events.emit(`tag-notifications:update`, {
    title: Math.round(Math.random()*100)
  });
}

function updateOnlineIndicator(){
  let rnd = Math.random();
  events.emit(`indicator-system:update`, {
    state: rnd>0.5?'success':'danger'
  });
}

setInterval(updateUserCard, 5000);
setInterval(updateNotificationsTag, 5000);
setInterval(updateOnlineIndicator, 5000);

function registerEvents(evs){
  console.log(Object.keys(evs));
  Object.keys(evs).forEach(eventName => {
    events.on(eventName, evs[eventName]);
  });
}


const menu = {
  side: {
    sections: [{
      id: 'elements',
      title: 'Элементы',
      priority: 1
    },{
      id: 'menus',
      title: 'Меню',
      priority: -1
    }, {
      id: 'form',
      title: 'Формы',
      priority: -1
    }, {
      id: 'overview',
      title: 'Обзор',
      priority: 10
    }, {
      id: 'table',
      title: 'Таблицы',
      priority: 5
    }, {
      id: 'frame',
      title: 'Фреймворк',
      priority: 9
    }],
    items: [{
      id: 'index',
      section: 'overview',
      title: 'Индекс',
      url: './index.html'
    },{
      id: 'index',
      section: 'frame',
      title: 'Обзор',
      url: './frame.index.html'
    },{
      id: 'buttons',
      section: 'elements',
      title: 'Кнопки',
      url: './buttons.html'
    },{
      id: 'buttons.groups',
      section: 'elements',
      title: 'Кнопки в группах',
      url: './buttons.groups.html'
    },{
      id: 'tags',
      section: 'elements',
      title: 'Тэги',
      url: './tags.html'
    },{
      id: 'booleans',
      section: 'elements',
      title: 'Булевы',
      url: './booleans.html'
    },{
      id: 'images',
      section: 'elements',
      title: 'Изображения',
      url: './images.html'
    },{
      id: 'links',
      section: 'elements',
      title: 'Ссылки',
      url: './links.html'
    },{
      id: 'menu.top',
      section: 'menus',
      title: 'Верхнее меню',
      url: './menu.top.html'
    },{
      id: 'menu.side',
      section: 'menus',
      title: 'Боковое меню',
      url: './menu.side.html'
    }]
  },
  top: {
    sections: [{
      id: 'system',
      title: 'Система',
      place: 'end',
      indicator: {
        size: 'small',
        labels: {
          success: 'Подключен',
          danger: 'Отключен',
        },
        state: 'danger',
        register: registerEvents
      }
    }, {
      id: 'account',
      type: 'component',
      component: 'UIUserCard',
      priority: -100,
      right: true,
      place: 'end',
      props:{
        register: registerEvents
      }
    }, {
      id: 'notifications',
      url: '/notifications.html',
      icon: {
        font: 'envelope',
        size: 'medium',
        svg: '',
        src: '',
      },
      tag: {
        padding: 'small',
        bold: true,
        color: 'warning',
        title: 0,
        register: registerEvents
      },
      showOnTouch: true,
      place: 'end'
    }],
    items: [{
      id: 'blog',
      title: 'Блог',
      place: 'start',
      hidden: 'touch',
      url: './blog.html'
    },{
      id: 'system.info',
      section: 'system',
      type: 'component',
      component: 'UIProgress',
      props: {
        value: 10,
        max: 100
      }
    },{
      id: 'account.profile',
      title: 'Profile',
      section: 'account',
      url: '/profile'
    },{
      id: 'account.logout',
      break: true,
      section: 'account',
      priority: -100,
      title: 'Выход',
      url: 		'/logout'
    }]
  },
};

export default menu;
