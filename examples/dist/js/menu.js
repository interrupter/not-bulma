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
                        url: "/docs/elements/block/block.inner.vertical.html",
                    },
                    {
                        id: "elements.blocks.block",
                        title: "Блок",
                        url: "/docs/elements/block/block.html",
                    },
                    {
                        id: "elements.blocks.box",
                        title: "Коробка",
                        url: "/docs/elements/block/box.html",
                    },
                    {
                        id: "elements.blocks.content",
                        title: "Контент",
                        url: "/docs/elements/block/content.html",
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
                        url: "/docs/elements/button/button.html",
                    },
                    {
                        id: "elements.buttons.button.close",
                        title: "Кнопка закрыть",
                        url: "/docs/elements/button/button.close.html",
                    },
                    {
                        id: "elements.buttons.button.switch",
                        title: "Кнопка переключатель",
                        url: "/docs/elements/button/button.switch.html",
                    },
                    {
                        id: "elements.buttons.buttons.row",
                        title: "Строка кнопок",
                        url: "/docs/elements/button/buttons.row.html",
                    },
                    {
                        id: "elements.buttons.buttons",
                        title: "Группы кнопок",
                        url: "/docs/elements/button/buttons.html",
                    },
                    {
                        id: "elements.buttons.buttons.switcher",
                        title: "Группа переключателей",
                        url: "/docs/elements/button/buttons.switchers.html",
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
                        url: "/docs/elements/form/form.control.html",
                    },
                    {
                        id: "elements.forms.form.input.errors",
                        title: "Ошибки элемента ввода формы",
                        url: "/docs/elements/form/form.input.errors.html",
                    },
                    {
                        id: "elements.forms.form.input",
                        title: "Элемент ввода формы",
                        url: "/docs/elements/form/form.input.html",
                    },
                    {
                        id: "elements.forms.form.input.validated.icon",
                        title: "Иконка валидности поля ввода",
                        url: "/docs/elements/form/form.input.validated.icon.html",
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
                        url: "/docs/elements/icon/icon.button.with.tag.html",
                    },
                    {
                        id: "elements.icons.icon.floating",
                        title: "Плавающая иконка",
                        url: "/docs/elements/icon/icon.floating.html",
                    },
                    {
                        id: "elements.icons.icon.font",
                        title: "Иконка шрифта",
                        url: "/docs/elements/icon/icon.font.html",
                    },
                    {
                        id: "elements.icons.icon",
                        title: "Иконка",
                        url: "/docs/elements/icon/icon.html",
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
                        url: "/docs/elements/image/image.html",
                    },
                    {
                        id: "elements.images.images",
                        title: "Изображения",
                        url: "/docs/elements/image/images.html",
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
                        url: "/docs/elements/input/autocomplete.html",
                    },
                    {
                        id: "elements.inputs.checkbox.list",
                        title: "Список чекбоксов",
                        url: "/docs/elements/input/checkbox.list.html",
                    },
                    {
                        id: "elements.inputs.checkbox",
                        title: "Чекбокс",
                        url: "/docs/elements/input/checkbox.html",
                    },
                    {
                        id: "elements.inputs.color",
                        title: "Цвет",
                        url: "/docs/elements/input/color.html",
                    },
                    {
                        id: "elements.inputs.control",
                        title: "Контрол",
                        url: "/docs/elements/input/control.html",
                    },
                    {
                        id: "elements.inputs.date",
                        title: "Дата",
                        url: "/docs/elements/input/date.html",
                    },
                    {
                        id: "elements.inputs.datetime.in.tz",
                        title: "Дата и время в таймзоне",
                        url: "/docs/elements/input/datetime.in.tz.html",
                    },
                    {
                        id: "elements.inputs.email",
                        title: "Email",
                        url: "/docs/elements/input/email.html",
                    },
                    {
                        id: "elements.inputs.hidden",
                        title: "Скрытое",
                        url: "/docs/elements/input/hidden.html",
                    },
                    {
                        id: "elements.inputs.json.area",
                        title: "JSON",
                        url: "/docs/elements/input/json.area.html",
                    },
                    {
                        id: "elements.inputs.label",
                        title: "Название поля",
                        url: "/docs/elements/input/label.html",
                    },
                    {
                        id: "elements.inputs.list.of.models",
                        title: "Список моделей",
                        url: "/docs/elements/input/list.of.models.html",
                    },
                    {
                        id: "elements.inputs.named.numbers.list",
                        title: "Список именованных значений",
                        url: "/docs/elements/input/named.numbers.list.html",
                    },
                    {
                        id: "elements.inputs.number",
                        title: "Число",
                        url: "/docs/elements/input/number.html",
                    },
                    {
                        id: "elements.inputs.password",
                        title: "Пароль",
                        url: "/docs/elements/input/password.html",
                    },
                    {
                        id: "elements.inputs.radio.buttons",
                        title: "Радио кнопки",
                        url: "/docs/elements/input/radio.buttons.html",
                    },
                    {
                        id: "elements.inputs.range",
                        title: "Range",
                        url: "/docs/elements/input/range.html",
                    },
                    {
                        id: "elements.inputs.select.from.model",
                        title: "Выбор из модели",
                        url: "/docs/elements/input/select.from.model.html",
                    },
                    {
                        id: "elements.inputs.select.option",
                        title: "Опция выпадающего списка",
                        url: "/docs/elements/input/select.option.html",
                    },
                    {
                        id: "elements.inputs.select",
                        title: "Выпадающий список",
                        url: "/docs/elements/input/select.html",
                    },
                    {
                        id: "elements.inputs.select.multiple",
                        title: "Выпадающий список (множественный выбор)",
                        url: "/docs/elements/input/select.multiple.html",
                    },
                    {
                        id: "elements.inputs.switch.list",
                        title: "Список переключателей",
                        url: "/docs/elements/input/switch.list.html",
                    },
                    {
                        id: "elements.inputs.switch",
                        title: "Переключатель",
                        url: "/docs/elements/input/switch.html",
                    },
                    {
                        id: "elements.inputs.tag.select",
                        title: "Метки",
                        url: "/docs/elements/input/tag.select.html",
                    },
                    {
                        id: "elements.inputs.telephone",
                        title: "Телефон",
                        url: "/docs/elements/input/telephone.html",
                    },
                    {
                        id: "elements.inputs.textarea",
                        title: "Текст большой",
                        url: "/docs/elements/input/textarea.html",
                    },
                    {
                        id: "elements.inputs.textfield",
                        title: "Текст",
                        url: "/docs/elements/input/textfield.html",
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
                        url: "/docs/elements/layout/column.html",
                    },
                    {
                        id: "elements.layouts.columns",
                        title: "Колонки",
                        url: "/docs/elements/layout/columns.html",
                    },
                    {
                        id: "elements.layouts.container",
                        title: "Контейнер",
                        url: "/docs/elements/layout/container.html",
                    },
                    {
                        id: "elements.layouts.footer",
                        title: "Футер",
                        url: "/docs/elements/layout/footer.html",
                    },
                    {
                        id: "elements.layouts.level.item",
                        title: "Элемент уровня",
                        url: "/docs/elements/layout/level.item.html",
                    },
                    {
                        id: "elements.layouts.level",
                        title: "Уровень",
                        url: "/docs/elements/layout/level.html",
                    },
                    {
                        id: "elements.layouts.panel.side",
                        title: "Панель - боковая",
                        url: "/docs/elements/layout/panel.side.html",
                    },
                    {
                        id: "elements.layouts.panel.top",
                        title: "Панель - верхняя",
                        url: "/docs/elements/layout/panel.top.html",
                    },
                    {
                        id: "elements.layouts.section",
                        title: "Секция",
                        url: "/docs/elements/layout/section.html",
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
                        url: "/docs/elements/link/link.html",
                    },
                    {
                        id: "elements.links.links",
                        title: "Ссылки",
                        url: "/docs/elements/link/links.html",
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
                                url: "/docs/elements/list/endless/endless.list.navigation.html",
                            },
                            {
                                id: "elements.lists.endless.list.simple.item",
                                title: "Элемент списка",
                                url: "/docs/elements/list/endless/endless.list.simple.item.html",
                            },
                            {
                                id: "elements.lists.endless.list",
                                title: "Список",
                                url: "/docs/elements/list/endless/endless.list.html",
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
                                url: "/docs/elements/list/select/list.select.buttons.with.groups.html",
                            },
                            {
                                id: "elements.lists.list.select",
                                title: "Выбор из списка",
                                url: "/docs/elements/list/select/list.select.html",
                            },
                            {
                                id: "elements.lists.list.select.with.groups",
                                title: "Выбор из списка с группами",
                                url: "/docs/elements/list/select/list.select.with.groups.html",
                            },
                        ],
                    },
                    {
                        id: "elements.lists.list.block",
                        title: "Блок списка",
                        url: "/docs/elements/list/list.block.html",
                    },
                    {
                        id: "elements.lists.list.empty.placeholder",
                        title: "Пустой список",
                        url: "/docs/elements/list/empty.placeholder.html",
                    },
                    {
                        id: "elements.lists.list.item",
                        title: "Элемент списка",
                        url: "/docs/elements/list/list.item.html",
                    },

                    {
                        id: "elements.lists.list",
                        title: "Список",
                        url: "/docs/elements/list/list.html",
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
                        url: "/docs/elements/modal/generic.selector.html",
                    },
                    {
                        id: "elements.modals.modal",
                        title: "Модальное окно",
                        url: "/docs/elements/modal/modal.html",
                    },
                    {
                        id: "elements.modals.overlay",
                        title: "Оверлэй",
                        url: "/docs/elements/modal/overlay.html",
                    },
                ],
            },
            {
                id: "breadcrumbs",
                section: "breadcrumbs",
                title: "notBreadcrumbs",
                url: "/docs/frame/breadcrumbs/breadcrumbs.html",
            },
            {
                id: "elements.notifications",
                section: "elements",
                title: "Уведомления",
                items: [
                    {
                        id: "elements.notifications.cookie.notification",
                        title: "Использовании Cookies",
                        url: "/docs/elements/notification/cookie.notification.html",
                    },
                    {
                        id: "elements.notifications.message",
                        title: "Сообщение",
                        url: "/docs/elements/notification/message.html",
                    },
                    {
                        id: "elements.notifications.error",
                        title: "Ошибка",
                        url: "/docs/elements/notification/error.html",
                    },
                    {
                        id: "elements.notifications.success",
                        title: "Успех",
                        url: "/docs/elements/notification/success.html",
                    },
                ],
            },
            {
                id: "elements.navigations",
                section: "elements",
                title: "Навигация",
                items: [
                    {
                        id: "elements.navigations.top",
                        title: "Верхнее меню",
                        url: "/docs/elements/navigation/navbar.top.html",
                        items: [
                            {
                                id: "elements.navigations.top.brand",
                                title: "Брэнд",
                                url: "/docs/elements/navigation/navbar.brand.html",
                            },
                            {
                                id: "elements.navigations.top.brand.wrapper",
                                title: "Брэнд, обертка элемента",
                                url: "/docs/elements/navigation/navbar.brand.wrapper.html",
                            },
                            {
                                id: "elements.navigations.top.burger",
                                title: "Бургер",
                                url: "/docs/elements/navigation/navbar.burger.html",
                            },
                            {
                                id: "elements.navigations.top.item",
                                title: "Элемент",
                                url: "/docs/elements/navigation/navbar.item.html",
                            },
                            {
                                id: "elements.navigations.top.item.link",
                                title: "Ссылка",
                                url: "/docs/elements/navigation/navbar.item.link.html",
                            },
                            {
                                id: "elements.navigations.top.item.text",
                                title: "Текст",
                                url: "/docs/elements/navigation/navbar.item.text.html",
                            },
                            {
                                id: "elements.navigations.top.item.devider",
                                title: "Разделитель",
                                url: "/docs/elements/navigation/navbar.item.devider.html",
                            },
                        ],
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
                        url: "/docs/elements/various/boolean.labeled.html",
                    },
                    {
                        id: "elements.various.boolean",
                        title: "Булево",
                        url: "/docs/elements/various/boolean.html",
                    },
                    {
                        id: "elements.various.booleans",
                        title: "Булевы",
                        url: "/docs/elements/various/booleans.html",
                    },
                    {
                        id: "elements.various.censored",
                        title: "Скрытое значение",
                        url: "/docs/elements/various/censored.html",
                    },
                    {
                        id: "elements.various.errors.list",
                        title: "Список ошибок",
                        url: "/docs/elements/various/errors.list.html",
                    },
                    {
                        id: "elements.various.indicator",
                        title: "Индикатор",
                        url: "/docs/elements/various/indicator.html",
                    },
                    {
                        id: "elements.various.loader",
                        title: "Загрузка...",
                        url: "/docs/elements/various/loader.html",
                    },
                    {
                        id: "elements.various.progress",
                        title: "Прогресс",
                        url: "/docs/elements/various/progress.html",
                    },
                    {
                        id: "elements.various.select.from.model.on.demand.inline",
                        title: "Выбор из модели по запросу встроенный",
                        url: "/docs/elements/various/select.from.model.on.demand.inline.html",
                    },
                    {
                        id: "elements.various.select.from.model.with.search.modal",
                        title: "Выбор из модели с модальным поиском",
                        url: "/docs/elements/various/select.from.model.with.search.modal.html",
                    },
                    {
                        id: "elements.various.show.one.from.list",
                        title: "Один из списка",
                        url: "/docs/elements/various/show.one.from.list.html",
                    },
                    {
                        id: "elements.various.simple.search.input",
                        title: "Поиск",
                        url: "/docs/elements/various/simple.search.input.html",
                    },
                    {
                        id: "elements.various.tag",
                        title: "Метки",
                        url: "/docs/elements/various/tag.html",
                    },
                    {
                        id: "elements.various.tag.value.list",
                        title: "Список меток и значений",
                        url: "/docs/elements/various/tag.value.list.html",
                    },
                    {
                        id: "elements.various.tag.value",
                        title: "Метка и значение",
                        url: "/docs/elements/various/tag.value.html",
                    },
                    {
                        id: "elements.various.title",
                        title: "Заголовок",
                        url: "/docs/elements/various/title.html",
                    },
                    {
                        id: "elements.various.user.card",
                        title: "Карточка пользователя",
                        url: "/docs/elements/various/user.card.html",
                    },
                ],
            },
            {
                id: "form.ui",
                section: "form",
                title: "UIForm",
                url: "/docs/frame/form/UIForm.html",
            },
            {
                id: "form.not",
                section: "form",
                title: "notForm",
                url: "/docs/frame/form/notForm.html",
            },
            {
                id: "form.set",
                section: "form",
                title: "notFormSet",
                url: "/docs/frame/form/notFormSet.html",
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
                url: "/docs/frame/index.html",
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
