const events = new EventEmitter();
function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

function updateUserCard() {
    let roles = ["root", "admin", "manager", "client", "user", "guest"];
    let usernames = [
        "Root",
        "John Doe",
        "Jack Smith",
        "Ellen hunt",
        "Nikita Belucci",
        "Vernor von Braun",
    ];
    shuffle(roles);
    shuffle(usernames);
    events.emit(`usercard-account:update`, {
        username: usernames[0],
        role: roles[0],
    });
}

function updateNotificationsTag() {
    events.emit(`tag-notifications:update`, {
        title: Math.round(Math.random() * 100),
    });
}

function updateOnlineIndicator() {
    let rnd = Math.random();
    events.emit(`indicator-system:update`, {
        state: rnd > 0.5 ? "success" : "danger",
    });
}

setInterval(updateUserCard, 5000);
setInterval(updateNotificationsTag, 5000);
setInterval(updateOnlineIndicator, 5000);

function registerEvents(evs) {
    console.log(Object.keys(evs));
    Object.keys(evs).forEach((eventName) => {
        events.on(eventName, evs[eventName]);
    });
}

const menu = {
    side: {
        sections: [
            {
                id: "filter",
                title: "Поиск",
                component: "UISampleFilter",
                type: "component",
                priority: 100,
            },
            {
                id: "breadcrumbs",
                title: "Хлебные крошки",
                priority: 1,
            },
            {
                id: "elements",
                title: "Элементы",
                priority: 1,
            },
            {
                id: "navigation",
                title: "Навигация",
                priority: -1,
            },
            {
                id: "form",
                title: "Формы",
                priority: -1,
            },
            {
                id: "overview",
                title: "Обзор",
                priority: 10,
            },
            {
                id: "table",
                title: "Таблицы",
                priority: 5,
            },
            {
                id: "frame",
                title: "Фреймворк",
                priority: 9,
            },
        ],
        items: [
            {
                id: "elements.blocks",
                section: "elements",
                title: "Блоки",
                items: [
                    {
                        id: "elements.blocks.block.inner.vertical",
                        title: "Блок внутренний вертикальный",
                        url: "http://localhost:3000/docs/elements/blocks/block.inner.vertical.html",
                    },
                    {
                        id: "elements.blocks.block",
                        title: "Блок",
                        url: "http://localhost:3000/docs/elements/blocks/block.html",
                    },
                    {
                        id: "elements.blocks.box",
                        title: "Коробка",
                        url: "http://localhost:3000/docs/elements/blocks/box.html",
                    },
                    {
                        id: "elements.blocks.content",
                        title: "Контент",
                        url: "http://localhost:3000/docs/elements/blocks/content.html",
                    },
                ],
            },
            {
                id: "elements.buttons",
                section: "elements",
                title: "Кнопки",
                items: [
                    {
                        id: "elements.buttons.button",
                        title: "Кнопка",
                        url: "http://localhost:3000/docs/elements/buttons/button.html",
                    },
                    {
                        id: "elements.buttons.button.close",
                        title: "Кнопка закрыть",
                        url: "http://localhost:3000/docs/elements/buttons/button.close.html",
                    },
                    {
                        id: "elements.buttons.button.switch",
                        title: "Кнопка переключатель",
                        url: "http://localhost:3000/docs/elements/buttons/button.switch.html",
                    },
                    {
                        id: "elements.buttons.buttons.row",
                        title: "Строка кнопок",
                        url: "http://localhost:3000/docs/elements/buttons/buttons.row.html",
                    },
                    {
                        id: "elements.buttons.buttons",
                        title: "Группы кнопок",
                        url: "http://localhost:3000/docs/elements/buttons/buttons.html",
                    },
                    {
                        id: "elements.buttons.buttons.switcher",
                        title: "Группа переключателей",
                        url: "http://localhost:3000/docs/elements/buttons/buttons.switchers.html",
                    },
                ],
            },

            {
                id: "elements.forms",
                section: "elements",
                title: "Формы",
                items: [
                    {
                        id: "elements.forms.form.control",
                        title: "Контрол формы",
                        url: "http://localhost:3000/docs/elements/forms/form.control.html",
                    },
                    {
                        id: "elements.forms.form.input.errors",
                        title: "Ошибки элемента ввода формы",
                        url: "http://localhost:3000/docs/elements/forms/form.input.errors.html",
                    },
                    {
                        id: "elements.forms.form.input",
                        title: "Элемент ввода формы",
                        url: "http://localhost:3000/docs/elements/forms/form.input.html",
                    },
                    {
                        id: "elements.forms.form.input.validated.icon",
                        title: "Иконка валидности поля ввода",
                        url: "http://localhost:3000/docs/elements/forms/form.input.validated.icon.html",
                    },
                ],
            },
            {
                id: "elements.icons",
                section: "elements",
                title: "Иконки",
                items: [
                    {
                        id: "elements.icons.icon.button.with.tag",
                        title: "Иконка кнопка с меткой",
                        url: "http://localhost:3000/docs/elements/icons/icon.button.with.tag.html",
                    },
                    {
                        id: "elements.icons.icon.floating",
                        title: "Плавающая иконка",
                        url: "http://localhost:3000/docs/elements/icons/icon.floating.html",
                    },
                    {
                        id: "elements.icons.icon.font",
                        title: "Иконка шрифта",
                        url: "http://localhost:3000/docs/elements/icons/icon.font.html",
                    },
                    {
                        id: "elements.icons.icon",
                        title: "Иконка",
                        url: "http://localhost:3000/docs/elements/icons/icon.html",
                    },
                ],
            },
            {
                id: "elements.images",
                section: "elements",
                title: "Изображения",
                items: [
                    {
                        id: "elements.images.image",
                        title: "Изображение",
                        url: "http://localhost:3000/docs/elements/images/image.html",
                    },
                    {
                        id: "elements.images.images",
                        title: "Изображения",
                        url: "http://localhost:3000/docs/elements/images/images.html",
                    },
                ],
            },
            {
                id: "elements.inputs",
                section: "elements",
                title: "Элементы ввода",
                items: [
                    {
                        id: "elements.inputs.autocomplete",
                        title: "Автодополнение",
                        url: "http://localhost:3000/docs/elements/inputs/autocomplete.html",
                    },
                    {
                        id: "elements.inputs.checkbox.list",
                        title: "Список чекбоксов",
                        url: "http://localhost:3000/docs/elements/inputs/checkbox.list.html",
                    },
                    {
                        id: "elements.inputs.checkbox",
                        title: "Чекбокс",
                        url: "http://localhost:3000/docs/elements/inputs/checkbox.html",
                    },
                    {
                        id: "elements.inputs.color",
                        title: "Цвет",
                        url: "http://localhost:3000/docs/elements/inputs/color.html",
                    },
                    {
                        id: "elements.inputs.control",
                        title: "Контрол",
                        url: "http://localhost:3000/docs/elements/inputs/control.html",
                    },
                    {
                        id: "elements.inputs.date",
                        title: "Дата",
                        url: "http://localhost:3000/docs/elements/inputs/date.html",
                    },
                    {
                        id: "elements.inputs.datetime.in.tz",
                        title: "Дата и время в таймзоне",
                        url: "http://localhost:3000/docs/elements/inputs/datetime.in.tz.html",
                    },
                    {
                        id: "elements.inputs.email",
                        title: "Email",
                        url: "http://localhost:3000/docs/elements/inputs/email.html",
                    },
                    {
                        id: "elements.inputs.hidden",
                        title: "Скрытое",
                        url: "http://localhost:3000/docs/elements/inputs/hidden.html",
                    },
                    {
                        id: "elements.inputs.json.area",
                        title: "JSON",
                        url: "http://localhost:3000/docs/elements/inputs/json.area.html",
                    },
                    {
                        id: "elements.inputs.label",
                        title: "Название поля",
                        url: "http://localhost:3000/docs/elements/inputs/label.html",
                    },
                    {
                        id: "elements.inputs.list.of.models",
                        title: "Список моделей",
                        url: "http://localhost:3000/docs/elements/inputs/list.of.models.html",
                    },
                    {
                        id: "elements.inputs.named.numbers.list",
                        title: "Список именованных значений",
                        url: "http://localhost:3000/docs/elements/inputs/named.numbers.list.html",
                    },
                    {
                        id: "elements.inputs.number",
                        title: "Число",
                        url: "http://localhost:3000/docs/elements/inputs/number.html",
                    },
                    {
                        id: "elements.inputs.password",
                        title: "Пароль",
                        url: "http://localhost:3000/docs/elements/inputs/password.html",
                    },
                    {
                        id: "elements.inputs.radio.buttons",
                        title: "Радио кнопки",
                        url: "http://localhost:3000/docs/elements/inputs/radio.buttons.html",
                    },
                    {
                        id: "elements.inputs.range",
                        title: "Range",
                        url: "http://localhost:3000/docs/elements/inputs/range.html",
                    },
                    {
                        id: "elements.inputs.select.from.model",
                        title: "Выбор из модели",
                        url: "http://localhost:3000/docs/elements/inputs/select.from.model.html",
                    },
                    {
                        id: "elements.inputs.select.option",
                        title: "Опция выпадающего списка",
                        url: "http://localhost:3000/docs/elements/inputs/select.option.html",
                    },
                    {
                        id: "elements.inputs.select",
                        title: "Выпадающий список",
                        url: "http://localhost:3000/docs/elements/inputs/select.html",
                    },
                    {
                        id: "elements.inputs.select.multiple",
                        title: "Выпадающий список (множественный выбор)",
                        url: "http://localhost:3000/docs/elements/inputs/select.multiple.html",
                    },
                    {
                        id: "elements.inputs.switch.list",
                        title: "Список переключателей",
                        url: "http://localhost:3000/docs/elements/inputs/switch.list.html",
                    },
                    {
                        id: "elements.inputs.switch",
                        title: "Переключатель",
                        url: "http://localhost:3000/docs/elements/inputs/switch.html",
                    },
                    {
                        id: "elements.inputs.tag.select",
                        title: "Метки",
                        url: "http://localhost:3000/docs/elements/inputs/tag.select.html",
                    },
                    {
                        id: "elements.inputs.telephone",
                        title: "Телефон",
                        url: "http://localhost:3000/docs/elements/inputs/telephone.html",
                    },
                    {
                        id: "elements.inputs.textarea",
                        title: "Текст большой",
                        url: "http://localhost:3000/docs/elements/inputs/textarea.html",
                    },
                    {
                        id: "elements.inputs.textfield",
                        title: "Текст",
                        url: "http://localhost:3000/docs/elements/inputs/textfield.html",
                    },
                ],
            },
            {
                id: "elements.layouts",
                section: "elements",
                title: "Раскладки",
                items: [
                    {
                        id: "elements.layouts.column",
                        title: "Колонка",
                        url: "http://localhost:3000/docs/elements/layouts/column.html",
                    },
                    {
                        id: "elements.layouts.columns",
                        title: "Колонки",
                        url: "http://localhost:3000/docs/elements/layouts/columns.html",
                    },
                    {
                        id: "elements.layouts.container",
                        title: "Контейнер",
                        url: "http://localhost:3000/docs/elements/layouts/container.html",
                    },
                    {
                        id: "elements.layouts.footer",
                        title: "Футер",
                        url: "http://localhost:3000/docs/elements/layouts/footer.html",
                    },
                    {
                        id: "elements.layouts.level.item",
                        title: "Элемент уровня",
                        url: "http://localhost:3000/docs/elements/layouts/level.item.html",
                    },
                    {
                        id: "elements.layouts.level",
                        title: "Уровень",
                        url: "http://localhost:3000/docs/elements/layouts/level.html",
                    },
                    {
                        id: "elements.layouts.panel.side",
                        title: "Панель - боковая",
                        url: "http://localhost:3000/docs/elements/layouts/panel.side.html",
                    },
                    {
                        id: "elements.layouts.panel.top",
                        title: "Панель - верхняя",
                        url: "http://localhost:3000/docs/elements/layouts/panel.top.html",
                    },
                    {
                        id: "elements.layouts.section",
                        title: "Секция",
                        url: "http://localhost:3000/docs/elements/layouts/section.html",
                    },
                ],
            },
            {
                id: "elements.links",
                section: "elements",
                title: "Ссылки",
                items: [
                    {
                        id: "elements.links.link",
                        title: "Ссылка",
                        url: "http://localhost:3000/docs/elements/links/link.html",
                    },
                    {
                        id: "elements.links.links",
                        title: "Ссылки",
                        url: "http://localhost:3000/docs/elements/links/links.html",
                    },
                ],
            },
            {
                id: "elements.lists",
                section: "elements",
                title: "Списки",
                items: [
                    {
                        id: "elements.lists.endless.list",
                        title: "Бесконечный список",
                        items: [
                            {
                                id: "elements.lists.endless.list.navigation",
                                title: "Навигация",
                                url: "http://localhost:3000/docs/elements/lists/endless/endless.list.navigation.html",
                            },
                            {
                                id: "elements.lists.endless.list.simple.item",
                                title: "Элемент списка",
                                url: "http://localhost:3000/docs/elements/lists/endless/endless.list.simple.item.html",
                            },
                            {
                                id: "elements.lists.endless.list",
                                title: "Список",
                                url: "http://localhost:3000/docs/elements/lists/endless/endless.list.html",
                            },
                        ],
                    },
                    {
                        id: "elements.lists.list.select",
                        title: "Выбор из списка",
                        items: [
                            {
                                id: "elements.lists.list.select.buttons.with.groups",
                                title: "Кнопки выбора с группировкой",
                                url: "http://localhost:3000/docs/elements/lists/select/list.select.buttons.with.groups.html",
                            },
                            {
                                id: "elements.lists.list.select",
                                title: "Выбор из списка",
                                url: "http://localhost:3000/docs/elements/lists/select/list.select.html",
                            },
                            {
                                id: "elements.lists.list.select.with.groups",
                                title: "Выбор из списка с группами",
                                url: "http://localhost:3000/docs/elements/lists/select/list.select.with.groups.html",
                            },
                        ],
                    },
                    {
                        id: "elements.lists.list.block",
                        title: "Блок списка",
                        url: "http://localhost:3000/docs/elements/lists/list.block.html",
                    },
                    {
                        id: "elements.lists.list.empty.placeholder",
                        title: "Пустой список",
                        url: "http://localhost:3000/docs/elements/lists/empty.placeholder.html",
                    },
                    {
                        id: "elements.lists.list.item",
                        title: "Элемент списка",
                        url: "http://localhost:3000/docs/elements/lists/list.item.html",
                    },

                    {
                        id: "elements.lists.list",
                        title: "Список",
                        url: "http://localhost:3000/docs/elements/lists/list.html",
                    },
                ],
            },
            {
                id: "elements.modals",
                section: "elements",
                title: "Модальные окна",
                items: [
                    {
                        id: "elements.modals.generic.selector",
                        title: "Селектор",
                        url: "http://localhost:3000/docs/elements/modals/generic.selector.html",
                    },
                    {
                        id: "elements.modals.modal",
                        title: "Модальное окно",
                        url: "http://localhost:3000/docs/elements/modals/modal.html",
                    },
                    {
                        id: "elements.modals.overlay",
                        title: "Оверлэй",
                        url: "http://localhost:3000/docs/elements/modals/overlay.html",
                    },
                ],
            },
            {
                id: "breadcrumbs",
                section: "breadcrumbs",
                title: "notBreadcrumbs",
                url: "http://localhost:3000/docs/frame/breadcrumbs/breadcrumbs.html",
            },
            {
                id: "elements.notifications",
                section: "elements",
                title: "Уведомления",
                items: [
                    {
                        id: "elements.notifications.cookie.notification",
                        title: "Использовании Cookies",
                        url: "http://localhost:3000/docs/elements/notifications/cookie.notification.html",
                    },
                    {
                        id: "elements.notifications.message",
                        title: "Сообщение",
                        url: "http://localhost:3000/docs/elements/notifications/message.html",
                    },
                    {
                        id: "elements.notifications.error",
                        title: "Ошибка",
                        url: "http://localhost:3000/docs/elements/notifications/error.html",
                    },
                    {
                        id: "elements.notifications.success",
                        title: "Успех",
                        url: "http://localhost:3000/docs/elements/notifications/success.html",
                    },
                ],
            },
            {
                id: "elements.navigations",
                section: "elements",
                title: "Навигация",
                items: [
                    {
                        id: "elements.navigations.top.item",
                        title: "Элемент",
                        url: "http://localhost:3000/docs/elements/navigations/top.item.html",
                    },
                    {
                        id: "elements.navigations.top.dropdown",
                        title: "Выпадающий список",
                        url: "http://localhost:3000/docs/elements/navigations/top.dropdown.html",
                    },
                ],
            },
            {
                id: "elements.various",
                section: "elements",
                title: "Разное",
                items: [
                    {
                        id: "elements.various.boolean.labeled",
                        title: "Булево с названием",
                        url: "http://localhost:3000/docs/elements/various/boolean.labeled.html",
                    },
                    {
                        id: "elements.various.boolean",
                        title: "Булево",
                        url: "http://localhost:3000/docs/elements/various/boolean.html",
                    },
                    {
                        id: "elements.various.booleans",
                        title: "Булевы",
                        url: "http://localhost:3000/docs/elements/various/booleans.html",
                    },
                    {
                        id: "elements.various.censored",
                        title: "Скрытое значение",
                        url: "http://localhost:3000/docs/elements/various/censored.html",
                    },
                    {
                        id: "elements.various.errors.list",
                        title: "Список ошибок",
                        url: "http://localhost:3000/docs/elements/various/errors.list.html",
                    },
                    {
                        id: "elements.various.indicator",
                        title: "Индикатор",
                        url: "http://localhost:3000/docs/elements/various/indicator.html",
                    },
                    {
                        id: "elements.various.loader",
                        title: "Загрузка...",
                        url: "http://localhost:3000/docs/elements/various/loader.html",
                    },
                    {
                        id: "elements.various.progress",
                        title: "Прогресс",
                        url: "http://localhost:3000/docs/elements/various/progress.html",
                    },
                    {
                        id: "elements.various.select.from.model.on.demand.inline",
                        title: "Выбор из модели по запросу встроенный",
                        url: "http://localhost:3000/docs/elements/various/select.from.model.on.demand.inline.html",
                    },
                    {
                        id: "elements.various.select.from.model.with.search.modal",
                        title: "Выбор из модели с модальным поиском",
                        url: "http://localhost:3000/docs/elements/various/select.from.model.with.search.modal.html",
                    },
                    {
                        id: "elements.various.show.one.from.list",
                        title: "Один из списка",
                        url: "http://localhost:3000/docs/elements/various/show.one.from.list.html",
                    },
                    {
                        id: "elements.various.simple.search.input",
                        title: "Поиск",
                        url: "http://localhost:3000/docs/elements/various/simple.search.input.html",
                    },
                    {
                        id: "elements.various.tag",
                        title: "Метки",
                        url: "http://localhost:3000/docs/elements/various/tag.html",
                    },
                    {
                        id: "elements.various.tag.value.list",
                        title: "Список меток и значений",
                        url: "http://localhost:3000/docs/elements/various/tag.value.list.html",
                    },
                    {
                        id: "elements.various.tag.value",
                        title: "Метка и значение",
                        url: "http://localhost:3000/docs/elements/various/tag.value.html",
                    },
                    {
                        id: "elements.various.title",
                        title: "Заголовок",
                        url: "http://localhost:3000/docs/elements/various/title.html",
                    },
                    {
                        id: "elements.various.user.card",
                        title: "Карточка пользователя",
                        url: "http://localhost:3000/docs/elements/various/user.card.html",
                    },
                ],
            },
            {
                id: "form.ui",
                section: "form",
                title: "UIForm",
                url: "http://localhost:3000/docs/frame/form/UIForm.html",
            },
            {
                id: "form.not",
                section: "form",
                title: "notForm",
                url: "http://localhost:3000/docs/frame/form/notForm.html",
            },
            {
                id: "form.set",
                section: "form",
                title: "notFormSet",
                url: "http://localhost:3000/docs/frame/form/notFormSet.html",
            },
            {
                id: "index",
                section: "overview",
                title: "Индекс",
                url: "./index.html",
            },
            {
                id: "index",
                section: "frame",
                title: "Обзор",
                url: "http://localhost:3000/docs/frame/index.html",
            },

            {
                id: "navigation.top",
                section: "navigation",
                title: "Верхнее меню",
                url: "http://localhost:3000/docs/frame/navigation/notTopMenu.html",
            },

            {
                id: "navigation.side",
                section: "navigation",
                title: "Боковое меню",
                url: "http://localhost:3000/docs/frame/navigation/notSideMenu.html",
            },
        ],
    },
    top: {
        sections: [
            {
                id: "system",
                title: "Система",
                place: "end",
                indicator: {
                    size: "small",
                    labels: {
                        success: "Подключен",
                        danger: "Отключен",
                    },
                    state: "danger",
                    register: registerEvents,
                },
            },
            {
                id: "account",
                type: "component",
                component: "UIUserCard",
                priority: -100,
                right: true,
                place: "end",
                props: {
                    register: registerEvents,
                },
            },
            {
                id: "notifications",
                url: "/notifications.html",
                icon: {
                    font: "envelope",
                    size: "medium",
                    svg: "",
                    src: "",
                },
                tag: {
                    padding: "small",
                    bold: true,
                    color: "warning",
                    title: 0,
                    register: registerEvents,
                },
                showOnTouch: true,
                place: "end",
            },
        ],
        items: [
            {
                id: "blog",
                title: "Блог",
                place: "start",
                hidden: "touch",
                url: "./blog.html",
            },
            {
                id: "system.info",
                section: "system",
                type: "component",
                component: "UIProgress",
                props: {
                    value: 10,
                    max: 100,
                },
            },
            {
                id: "account.profile",
                title: "Profile",
                section: "account",
                url: "/profile",
            },
            {
                id: "account.logout",
                break: true,
                section: "account",
                priority: -100,
                title: "Выход",
                url: "/logout",
            },
        ],
    },
};

export default menu;
