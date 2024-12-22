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
                id: "elements",
                title: "Элементы",
                priority: 1,
            },
            {
                id: "menus",
                title: "Меню",
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
                        url: "./blocks.block.inner.vertical.html",
                    },
                    {
                        id: "elements.blocks.block",
                        title: "Блок",
                        url: "./blocks.block.html",
                    },
                    {
                        id: "elements.blocks.box",
                        title: "Коробка",
                        url: "./blocks.box.html",
                    },
                    {
                        id: "elements.blocks.content",
                        title: "Контент",
                        url: "./blocks.content.html",
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
                        url: "./buttons.button.html",
                    },
                    {
                        id: "elements.buttons.button.switch",
                        title: "Кнопка переключатель",
                        url: "./buttons.button.switch.html",
                    },
                    {
                        id: "elements.buttons.buttons.row",
                        title: "Строка кнопок",
                        url: "./buttons.buttons.row.html",
                    },
                    {
                        id: "elements.buttons.buttons",
                        title: "Группы кнопок",
                        url: "./buttons.buttons.html",
                    },
                    {
                        id: "elements.buttons.buttons.switcher",
                        title: "Группа переключателей",
                        url: "./buttons.buttons.switchers.html",
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
                        url: "./images.image.html",
                    },
                    {
                        id: "elements.images.images",
                        title: "Изображения",
                        url: "./images.images.html",
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
                        url: "./forms.form.control.html",
                    },
                    {
                        id: "elements.forms.form.input.errors",
                        title: "Ошибки элемента ввода формы",
                        url: "./forms.form.input.errors.html",
                    },
                    {
                        id: "elements.forms.form.input",
                        title: "Элемент ввода формы",
                        url: "./forms.form.input.html",
                    },
                    {
                        id: "elements.forms.validated.icon",
                        title: "Иконка валидности поля ввода",
                        url: "./forms.validated.icon.html",
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
                        url: "./icons.icon.button.with.tag.html",
                    },
                    {
                        id: "elements.icons.icon.floating",
                        title: "Плавающая иконка",
                        url: "./icons.icon.floating.html",
                    },
                    {
                        id: "elements.icons.icon.font",
                        title: "Иконка шрифта",
                        url: "./icons.icon.font.html",
                    },
                    {
                        id: "elements.icons.icon",
                        title: "Иконка",
                        url: "./icons.icon.html",
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
                        url: "./links.link.html",
                    },
                    {
                        id: "elements.links.links",
                        title: "Ссылки",
                        url: "./links.links.html",
                    },
                ],
            },
            {
                id: "elements.various",
                section: "elements",
                title: "Разное",
                items: [
                    {
                        id: "elements.various.tag",
                        title: "Тэги",
                        url: "./various.tag.html",
                    },
                    {
                        id: "elements.various.boolean",
                        title: "Булевы",
                        url: "./various.boolean.html",
                    },
                ],
            },
            {
                id: "form.ui",
                section: "form",
                title: "UIForm",
                url: "./form.UIForm.html",
            },
            {
                id: "form.not",
                section: "form",
                title: "notForm",
                url: "./form.notForm.html",
            },
            {
                id: "form.set",
                section: "form",
                title: "notFormSet",
                url: "./form.notFormSet.html",
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
                url: "./frame.index.html",
            },

            {
                id: "menu.top",
                section: "menus",
                title: "Верхнее меню",
                url: "./menu.top.html",
            },
            {
                id: "menu.side",
                section: "menus",
                title: "Боковое меню",
                url: "./menu.side.html",
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
