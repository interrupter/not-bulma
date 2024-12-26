const events = new EventEmitter();
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function updateUserCard() {
    let roles = ["root", "admin", "manager", "client", "user", "guest"];
    let usernames = ["Root", "John Doe", "Jack Smith", "Ellen hunt", "Nikita Belucci", "Vernor von Braun"];
    shuffle(roles);
    shuffle(usernames);
    events.emit(`usercard-account:update`, {
        username: usernames[0],
        role: roles[0]
    });
}

function updateNotificationsTag() {
    events.emit(`tag-notifications:update`, {
        title: Math.round(Math.random() * 100)
    });
}

function updateOnlineIndicator() {
    let rnd = Math.random();
    events.emit(`indicator-system:update`, {
        state: rnd > 0.5 ? "success" : "danger"
    });
}

setInterval(updateUserCard, 5000);
setInterval(updateNotificationsTag, 5000);
setInterval(updateOnlineIndicator, 5000);

function registerEvents(evs) {
    console.log(Object.keys(evs));
    Object.keys(evs).forEach(eventName => {
        events.on(eventName, evs[eventName]);
    });
}

const menu = {
    side: {
        sections: [{
            id: "filter",
            title: "Поиск",
            component: "UISampleFilter",
            type: "component",
            priority: 100
        }, {
            id: "elements",
            title: "Элементы",
            priority: 1
        }, {
            id: "menus",
            title: "Меню",
            priority: -1
        }, {
            id: "form",
            title: "Формы",
            priority: -1
        }, {
            id: "overview",
            title: "Обзор",
            priority: 10
        }, {
            id: "table",
            title: "Таблицы",
            priority: 5
        }, {
            id: "frame",
            title: "Фреймворк",
            priority: 9
        }],
        items: [{
            id: "elements.blocks",
            section: "elements",
            title: "Блоки",
            items: [{
                id: "elements.blocks.block.inner.vertical",
                title: "Блок внутренний вертикальный",
                url: "./blocks.block.inner.vertical.html"
            }, {
                id: "elements.blocks.block",
                title: "Блок",
                url: "./blocks.block.html"
            }, {
                id: "elements.blocks.box",
                title: "Коробка",
                url: "./blocks.box.html"
            }, {
                id: "elements.blocks.content",
                title: "Контент",
                url: "./blocks.content.html"
            }]
        }, {
            id: "elements.buttons",
            section: "elements",
            title: "Кнопки",
            items: [{
                id: "elements.buttons.button",
                title: "Кнопка",
                url: "./buttons.button.html"
            }, {
                id: "elements.buttons.button.switch",
                title: "Кнопка переключатель",
                url: "./buttons.button.switch.html"
            }, {
                id: "elements.buttons.buttons.row",
                title: "Строка кнопок",
                url: "./buttons.buttons.row.html"
            }, {
                id: "elements.buttons.buttons",
                title: "Группы кнопок",
                url: "./buttons.buttons.html"
            }, {
                id: "elements.buttons.buttons.switcher",
                title: "Группа переключателей",
                url: "./buttons.buttons.switchers.html"
            }]
        }, {
            id: "elements.forms",
            section: "elements",
            title: "Формы",
            items: [{
                id: "elements.forms.form.control",
                title: "Контрол формы",
                url: "./forms.form.control.html"
            }, {
                id: "elements.forms.form.input.errors",
                title: "Ошибки элемента ввода формы",
                url: "./forms.form.input.errors.html"
            }, {
                id: "elements.forms.form.input",
                title: "Элемент ввода формы",
                url: "./forms.form.input.html"
            }, {
                id: "elements.forms.form.input.validated.icon",
                title: "Иконка валидности поля ввода",
                url: "./forms.form.input.validated.icon.html"
            }]
        }, {
            id: "elements.icons",
            section: "elements",
            title: "Иконки",
            items: [{
                id: "elements.icons.icon.button.with.tag",
                title: "Иконка кнопка с меткой",
                url: "./icons.icon.button.with.tag.html"
            }, {
                id: "elements.icons.icon.floating",
                title: "Плавающая иконка",
                url: "./icons.icon.floating.html"
            }, {
                id: "elements.icons.icon.font",
                title: "Иконка шрифта",
                url: "./icons.icon.font.html"
            }, {
                id: "elements.icons.icon",
                title: "Иконка",
                url: "./icons.icon.html"
            }]
        }, {
            id: "elements.images",
            section: "elements",
            title: "Изображения",
            items: [{
                id: "elements.images.image",
                title: "Изображение",
                url: "./images.image.html"
            }, {
                id: "elements.images.images",
                title: "Изображения",
                url: "./images.images.html"
            }]
        }, {
            id: "elements.inputs",
            section: "elements",
            title: "Элементы ввода",
            items: [{
                id: "elements.inputs.autocomplete",
                title: "Автодополнение",
                url: "./inputs.autocomplete.html"
            }, {
                id: "elements.inputs.checkbox.list",
                title: "Список чекбоксов",
                url: "./inputs.checkbox.list.html"
            }, {
                id: "elements.inputs.checkbox",
                title: "Чекбокс",
                url: "./inputs.checkbox.html"
            }, {
                id: "elements.inputs.color",
                title: "Цвет",
                url: "./inputs.color.html"
            }, {
                id: "elements.inputs.control",
                title: "Контрол",
                url: "./inputs.control.html"
            }, {
                id: "elements.inputs.date",
                title: "Дата",
                url: "./inputs.date.html"
            }, {
                id: "elements.inputs.datetime.in.tz",
                title: "Дата и время в таймзоне",
                url: "./inputs.datetime.in.tz.html"
            }, {
                id: "elements.inputs.email",
                title: "Email",
                url: "./inputs.email.html"
            }, {
                id: "elements.inputs.hidden",
                title: "Скрытое",
                url: "./inputs.hidden.html"
            }, {
                id: "elements.inputs.json.area",
                title: "JSON",
                url: "./inputs.json.area.html"
            }, {
                id: "elements.inputs.label",
                title: "Название поля",
                url: "./inputs.label.html"
            }, {
                id: "elements.inputs.list.of.models",
                title: "Список моделей",
                url: "./inputs.list.of.models.html"
            }, {
                id: "elements.inputs.named.numbers.list",
                title: "Список имнованных значений",
                url: "./inputs.named.numbers.list.html"
            }, {
                id: "elements.inputs.number",
                title: "Число",
                url: "./inputs.number.html"
            }, {
                id: "elements.inputs.password",
                title: "Пароль",
                url: "./inputs.password.html"
            }, {
                id: "elements.inputs.radio.buttons",
                title: "Радио кнопки",
                url: "./inputs.radio.buttons.html"
            }, {
                id: "elements.inputs.range",
                title: "Range",
                url: "./inputs.range.html"
            }, {
                id: "elements.inputs.select.from.model",
                title: "Выбор из модели",
                url: "./inputs.select.from.model.html"
            }, {
                id: "elements.inputs.select.option",
                title: "Опция выпадающего списка",
                url: "./inputs.select.option.html"
            }, {
                id: "elements.inputs.select",
                title: "Выпадающий список",
                url: "./inputs.select.html"
            }, {
                id: "elements.inputs.switch.list",
                title: "Список переключателей",
                url: "./inputs.switch.list.html"
            }, {
                id: "elements.inputs.switch",
                title: "Переключатель",
                url: "./inputs.switch.html"
            }, {
                id: "elements.inputs.tag.select",
                title: "Метки",
                url: "./inputs.tag.select.html"
            }, {
                id: "elements.inputs.telephone",
                title: "Телефон",
                url: "./inputs.telephone.html"
            }, {
                id: "elements.inputs.textarea",
                title: "Текст большой",
                url: "./inputs.textarea.html"
            }, {
                id: "elements.inputs.textfield",
                title: "Текст",
                url: "./inputs.textfield.html"
            }]
        }, {
            id: "elements.layouts",
            section: "elements",
            title: "Раскладки",
            items: [{
                id: "elements.layouts.column",
                title: "Колонка",
                url: "./layouts.column.html"
            }, {
                id: "elements.layouts.columns",
                title: "Колонки",
                url: "./layouts.columns.html"
            }, {
                id: "elements.layouts.container",
                title: "Контейнер",
                url: "./layouts.container.html"
            }, {
                id: "elements.layouts.footer",
                title: "Футер",
                url: "./layouts.footer.html"
            }, {
                id: "elements.layouts.level.item",
                title: "Элемент уровня",
                url: "./layouts.level.item.html"
            }, {
                id: "elements.layouts.level",
                title: "Уровень",
                url: "./layouts.level.html"
            }, {
                id: "elements.layouts.section",
                title: "Секция",
                url: "./layouts.section.html"
            }]
        }, {
            id: "elements.links",
            section: "elements",
            title: "Ссылки",
            items: [{
                id: "elements.links.link",
                title: "Ссылка",
                url: "./links.link.html"
            }, {
                id: "elements.links.links",
                title: "Ссылки",
                url: "./links.links.html"
            }]
        }, {
            id: "elements.lists",
            section: "elements",
            title: "Списки",
            items: [{
                id: "elements.lists.list.block",
                title: "Блок списка",
                url: "./lists.list.block.html"
            }, {
                id: "elements.lists.list.empty.placeholder",
                title: "Пустой список",
                url: "./lists.list.empty.placeholder.html"
            }, {
                id: "elements.lists.list.item",
                title: "Элемент списка",
                url: "./lists.list.item.html"
            }, {
                id: "elements.lists.list.select.buttons.with.groups",
                title: "Кнопки выбора с группировкой",
                url: "./lists.list.select.buttons.with.groups.html"
            }, {
                id: "elements.lists.list.select",
                title: "Выбор из списка",
                url: "./lists.list.select.html"
            }, {
                id: "elements.lists.list.select.with.groups",
                title: "Выбор из списка с группами",
                url: "./lists.list.select.with.groups.html"
            }, {
                id: "elements.lists.list",
                title: "Список",
                url: "./lists.list.html"
            }]
        }, {
            id: "elements.modals",
            section: "elements",
            title: "Модальные окна",
            items: [{
                id: "elements.modals.generic.selector",
                title: "Селектор",
                url: "./modals.generic.selector.html"
            }, {
                id: "elements.modals.modal",
                title: "Модальное окно",
                url: "./modals.modal.html"
            }, {
                id: "elements.modals.overlay",
                title: "Оверлэй",
                url: "./modals.overlay.html"
            }]
        }, {
            id: "elements.notifications",
            section: "elements",
            title: "Уведомления",
            items: [{
                id: "elements.notifications.cookie.notification",
                title: "Использовании Cookies",
                url: "./notifications.cookie.notification.html"
            }, {
                id: "elements.notifications.message",
                title: "Сообщение",
                url: "./notifications.message.html"
            }, {
                id: "elements.notifications.error",
                title: "Ошибка",
                url: "./notifications.error.html"
            }, {
                id: "elements.notifications.success",
                title: "Успех",
                url: "./notifications.success.html"
            }]
        }, {
            id: "elements.various",
            section: "elements",
            title: "Разное",
            items: [{
                id: "elements.various.boolean.labeled",
                title: "Булево с названием",
                url: "./various.boolean.labeled.html"
            }, {
                id: "elements.various.boolean",
                title: "Булево",
                url: "./various.boolean.html"
            }, {
                id: "elements.various.booleans",
                title: "Булевы",
                url: "./various.booleans.html"
            }, {
                id: "elements.various.censored",
                title: "Скрытое значение",
                url: "./various.censored.html"
            }, {
                id: "elements.various.errors.list",
                title: "Список ошибок",
                url: "./various.errors.list.html"
            }, {
                id: "elements.various.indicator",
                title: "Индикатор",
                url: "./various.indicator.html"
            }, {
                id: "elements.various.loader",
                title: "Загрузка...",
                url: "./various.loader.html"
            }, {
                id: "elements.various.select.from.model.on.demand.inline",
                title: "Выбор из модели по запросу встроенный",
                url: "./various.select.from.model.on.demand.inline.html"
            }, {
                id: "elements.various.select.from.model.with.search.modal",
                title: "Выбор из модели с модальным поиском",
                url: "./various.select.from.model.with.search.modal.html"
            }, {
                id: "elements.various.show.one.from.list",
                title: "Один из списка",
                url: "./various.show.one.from.list.html"
            }, {
                id: "elements.various.simple.search.input",
                title: "Поиск",
                url: "./various.simple.search.input.html"
            }, {
                id: "elements.various.tag",
                title: "Метки",
                url: "./various.tag.html"
            }, {
                id: "elements.various.tag.value.list",
                title: "Список меток и значений",
                url: "./various.tag.value.list.html"
            }, {
                id: "elements.various.tag.value",
                title: "Метка и значение",
                url: "./various.tag.value.html"
            }, {
                id: "elements.various.title",
                title: "Заголовок",
                url: "./various.title.html"
            }, {
                id: "elements.various.user.card",
                title: "Карточка пользователя",
                url: "./various.user.card.html"
            }]
        }, {
            id: "form.ui",
            section: "form",
            title: "UIForm",
            url: "./form.UIForm.html"
        }, {
            id: "form.not",
            section: "form",
            title: "notForm",
            url: "./form.notForm.html"
        }, {
            id: "form.set",
            section: "form",
            title: "notFormSet",
            url: "./form.notFormSet.html"
        }, {
            id: "index",
            section: "overview",
            title: "Индекс",
            url: "./index.html"
        }, {
            id: "index",
            section: "frame",
            title: "Обзор",
            url: "./frame.index.html"
        }, {
            id: "menu.top",
            section: "menus",
            title: "Верхнее меню",
            url: "./menu.top.html"
        }, {
            id: "menu.side",
            section: "menus",
            title: "Боковое меню",
            url: "./menu.side.html"
        }]
    },
    top: {
        sections: [{
            id: "system",
            title: "Система",
            place: "end",
            indicator: {
                size: "small",
                labels: {
                    success: "Подключен",
                    danger: "Отключен"
                },
                state: "danger",
                register: registerEvents
            }
        }, {
            id: "account",
            type: "component",
            component: "UIUserCard",
            priority: -100,
            right: true,
            place: "end",
            props: {
                register: registerEvents
            }
        }, {
            id: "notifications",
            url: "/notifications.html",
            icon: {
                font: "envelope",
                size: "medium",
                svg: "",
                src: ""
            },
            tag: {
                padding: "small",
                bold: true,
                color: "warning",
                title: 0,
                register: registerEvents
            },
            showOnTouch: true,
            place: "end"
        }],
        items: [{
            id: "blog",
            title: "Блог",
            place: "start",
            hidden: "touch",
            url: "./blog.html"
        }, {
            id: "system.info",
            section: "system",
            type: "component",
            component: "UIProgress",
            props: {
                value: 10,
                max: 100
            }
        }, {
            id: "account.profile",
            title: "Profile",
            section: "account",
            url: "/profile"
        }, {
            id: "account.logout",
            break: true,
            section: "account",
            priority: -100,
            title: "Выход",
            url: "/logout"
        }]
    }
};

export default menu;