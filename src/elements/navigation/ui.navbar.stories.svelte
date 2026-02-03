<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import UINavbar from "./ui.navbar.svelte";
    import { fn } from "storybook/test";

    // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
    const { Story } = defineMeta({
        title: "Elements/Navigations/UINavbar",
        component: UINavbar,
        tags: ["autodocs"],
        argTypes: {
            id: {
                type: "text",
            },
            root: {
                type: "text",
            },
            active: {
                type: "checkbox",
            },
            class: {
                type: "text",
            },
        },
        args: {
            onClick: fn(),
        },
    });

    const navbarItems = [
        {
            id: "filter",
            title: "Поиск",
            component: "UISampleFilter",
            type: "component",
            place: "start",
            href: "/docs/elements/block",
            priority: 100,
        },
        {
            id: "breadcrumbs",
            title: "Хлебные крошки",
            priority: 1,
            items: [
                {
                    id: "breadcrumbs",
                    section: "breadcrumbs",
                    title: "notBreadcrumbs",
                    href: "/docs/frame/breadcrumbs/breadcrumbs.html",
                },
            ],
        },
        {
            id: "elements",
            title: "Элементы",
            priority: 1,
            items: [
                {
                    id: "elements.blocks",
                    section: "elements",
                    title: "Блоки 1",
                    place: "start",
                    items: [
                        {
                            id: "elements.blocks.block.inner.vertical",
                            title: "Блок внутренний вертикальный",
                            href: "/docs/elements/block/block.inner.vertical.html",
                        },
                        {
                            id: "elements.blocks.block",
                            title: "Блок",
                            href: "/docs/elements/block/block.html",
                        },
                        {
                            break: true,
                        },
                        {
                            id: "elements.blocks.box",
                            title: "Коробка",
                            href: "/docs/elements/block/box.html",
                        },
                        {
                            id: "elements.blocks.content",
                            title: "Контент",
                            href: "/docs/elements/block/content.html",
                        },
                    ],
                },
                {
                    id: "elements.buttons",
                    section: "elements",
                    title: "Кнопки",
                    place: ["start", "end"],
                    items: [
                        {
                            id: "elements.buttons.button",
                            title: "Кнопка",
                            href: "/docs/elements/button/button.html",
                        },
                        {
                            id: "elements.buttons.button.close",
                            title: "Кнопка закрыть",
                            href: "/docs/elements/button/button.close.html",
                        },
                        {
                            id: "elements.buttons.button.switch",
                            title: "Кнопка переключатель",
                            href: "/docs/elements/button/button.switch.html",
                        },
                        {
                            id: "elements.buttons.buttons.row",
                            title: "Строка кнопок",
                            href: "/docs/elements/button/buttons.row.html",
                        },
                        {
                            id: "elements.buttons.buttons",
                            title: "Группы кнопок",
                            href: "/docs/elements/button/buttons.html",
                        },
                        {
                            id: "elements.buttons.buttons.switcher",
                            title: "Группа переключателей",
                            href: "/docs/elements/button/buttons.switchers.html",
                        },
                    ],
                },

                {
                    id: "elements.forms",
                    section: "elements",
                    title: "Формы",
                    place: "start",
                    items: [
                        {
                            id: "elements.forms.form.control",
                            title: "Контрол формы",
                            href: "/docs/elements/form/form.control.html",
                        },
                        {
                            id: "elements.forms.form.input.errors",
                            title: "Ошибки элемента ввода формы",
                            href: "/docs/elements/form/form.input.errors.html",
                        },
                        {
                            id: "elements.forms.form.input",
                            title: "Элемент ввода формы",
                            href: "/docs/elements/form/form.input.html",
                        },
                        {
                            id: "elements.forms.form.input.validated.icon",
                            title: "Иконка валидности поля ввода",
                            href: "/docs/elements/form/form.input.validated.icon.html",
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
                            href: "/docs/elements/icon/icon.button.with.tag.html",
                        },
                        {
                            id: "elements.icons.icon.floating",
                            title: "Плавающая иконка",
                            href: "/docs/elements/icon/icon.floating.html",
                        },
                        {
                            id: "elements.icons.icon.font",
                            title: "Иконка шрифта",
                            href: "/docs/elements/icon/icon.font.html",
                        },
                        {
                            id: "elements.icons.icon",
                            title: "Иконка",
                            href: "/docs/elements/icon/icon.html",
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
                            href: "/docs/elements/image/image.html",
                        },
                        {
                            id: "elements.images.images",
                            title: "Изображения",
                            href: "/docs/elements/image/images.html",
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
                            href: "/docs/elements/input/autocomplete.html",
                        },
                        {
                            id: "elements.inputs.checkbox.list",
                            title: "Список чекбоксов",
                            href: "/docs/elements/input/checkbox.list.html",
                        },
                        {
                            id: "elements.inputs.checkbox",
                            title: "Чекбокс",
                            href: "/docs/elements/input/checkbox.html",
                        },
                        {
                            id: "elements.inputs.color",
                            title: "Цвет",
                            href: "/docs/elements/input/color.html",
                        },
                        {
                            id: "elements.inputs.control",
                            title: "Контрол",
                            href: "/docs/elements/input/control.html",
                        },
                        {
                            id: "elements.inputs.date",
                            title: "Дата",
                            href: "/docs/elements/input/date.html",
                        },
                        {
                            id: "elements.inputs.datetime.in.tz",
                            title: "Дата и время в таймзоне",
                            href: "/docs/elements/input/datetime.in.tz.html",
                        },
                        {
                            id: "elements.inputs.email",
                            title: "Email",
                            href: "/docs/elements/input/email.html",
                        },
                        {
                            id: "elements.inputs.hidden",
                            title: "Скрытое",
                            href: "/docs/elements/input/hidden.html",
                        },
                        {
                            id: "elements.inputs.json.area",
                            title: "JSON",
                            href: "/docs/elements/input/json.area.html",
                        },
                        {
                            id: "elements.inputs.label",
                            title: "Название поля",
                            href: "/docs/elements/input/label.html",
                        },
                        {
                            id: "elements.inputs.list.of.models",
                            title: "Список моделей",
                            href: "/docs/elements/input/list.of.models.html",
                        },
                        {
                            id: "elements.inputs.named.numbers.list",
                            title: "Список именованных значений",
                            href: "/docs/elements/input/named.numbers.list.html",
                        },
                        {
                            id: "elements.inputs.number",
                            title: "Число",
                            href: "/docs/elements/input/number.html",
                        },
                        {
                            id: "elements.inputs.password",
                            title: "Пароль",
                            href: "/docs/elements/input/password.html",
                        },
                        {
                            id: "elements.inputs.radio.buttons",
                            title: "Радио кнопки",
                            href: "/docs/elements/input/radio.buttons.html",
                        },
                        {
                            id: "elements.inputs.range",
                            title: "Range",
                            href: "/docs/elements/input/range.html",
                        },
                        {
                            id: "elements.inputs.select.from.model",
                            title: "Выбор из модели",
                            href: "/docs/elements/input/select.from.model.html",
                        },
                        {
                            id: "elements.inputs.select.option",
                            title: "Опция выпадающего списка",
                            href: "/docs/elements/input/select.option.html",
                        },
                        {
                            id: "elements.inputs.select",
                            title: "Выпадающий список",
                            href: "/docs/elements/input/select.html",
                        },
                        {
                            id: "elements.inputs.select.multiple",
                            title: "Выпадающий список (множественный выбор)",
                            href: "/docs/elements/input/select.multiple.html",
                        },
                        {
                            id: "elements.inputs.switch.list",
                            title: "Список переключателей",
                            href: "/docs/elements/input/switch.list.html",
                        },
                        {
                            id: "elements.inputs.switch",
                            title: "Переключатель",
                            href: "/docs/elements/input/switch.html",
                        },
                        {
                            id: "elements.inputs.tag.select",
                            title: "Метки",
                            href: "/docs/elements/input/tag.select.html",
                        },
                        {
                            id: "elements.inputs.telephone",
                            title: "Телефон",
                            href: "/docs/elements/input/telephone.html",
                        },
                        {
                            id: "elements.inputs.textarea",
                            title: "Текст большой",
                            href: "/docs/elements/input/textarea.html",
                        },
                        {
                            id: "elements.inputs.textfield",
                            title: "Текст",
                            href: "/docs/elements/input/textfield.html",
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
                            href: "/docs/elements/layout/column.html",
                        },
                        {
                            id: "elements.layouts.columns",
                            title: "Колонки",
                            href: "/docs/elements/layout/columns.html",
                        },
                        {
                            id: "elements.layouts.container",
                            title: "Контейнер",
                            href: "/docs/elements/layout/container.html",
                        },
                        {
                            id: "elements.layouts.footer",
                            title: "Футер",
                            href: "/docs/elements/layout/footer.html",
                        },
                        {
                            id: "elements.layouts.level.item",
                            title: "Элемент уровня",
                            href: "/docs/elements/layout/level.item.html",
                        },
                        {
                            id: "elements.layouts.level",
                            title: "Уровень",
                            href: "/docs/elements/layout/level.html",
                        },
                        {
                            id: "elements.layouts.panel.side",
                            title: "Панель - боковая",
                            href: "/docs/elements/layout/panel.side.html",
                        },
                        {
                            id: "elements.layouts.panel.top",
                            title: "Панель - верхняя",
                            href: "/docs/elements/layout/panel.top.html",
                        },
                        {
                            id: "elements.layouts.section",
                            title: "Секция",
                            href: "/docs/elements/layout/section.html",
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
                            href: "/docs/elements/link/link.html",
                        },
                        {
                            id: "elements.links.links",
                            title: "Ссылки",
                            href: "/docs/elements/link/links.html",
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
                                    href: "/docs/elements/list/endless/endless.list.navigation.html",
                                },
                                {
                                    id: "elements.lists.endless.list.simple.item",
                                    title: "Элемент списка",
                                    href: "/docs/elements/list/endless/endless.list.simple.item.html",
                                },
                                {
                                    id: "elements.lists.endless.list",
                                    title: "Список",
                                    href: "/docs/elements/list/endless/endless.list.html",
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
                                    href: "/docs/elements/list/select/list.select.buttons.with.groups.html",
                                },
                                {
                                    id: "elements.lists.list.select",
                                    title: "Выбор из списка",
                                    href: "/docs/elements/list/select/list.select.html",
                                },
                                {
                                    id: "elements.lists.list.select.with.groups",
                                    title: "Выбор из списка с группами",
                                    href: "/docs/elements/list/select/list.select.with.groups.html",
                                },
                            ],
                        },
                        {
                            id: "elements.lists.list.block",
                            title: "Блок списка",
                            href: "/docs/elements/list/list.block.html",
                        },
                        {
                            id: "elements.lists.list.empty.placeholder",
                            title: "Пустой список",
                            href: "/docs/elements/list/empty.placeholder.html",
                        },
                        {
                            id: "elements.lists.list.item",
                            title: "Элемент списка",
                            href: "/docs/elements/list/list.item.html",
                        },

                        {
                            id: "elements.lists.list",
                            title: "Список",
                            href: "/docs/elements/list/list.html",
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
                            href: "/docs/elements/modal/generic.selector.html",
                        },
                        {
                            id: "elements.modals.modal",
                            title: "Модальное окно",
                            href: "/docs/elements/modal/modal.html",
                        },
                        {
                            id: "elements.modals.overlay",
                            title: "Оверлэй",
                            href: "/docs/elements/modal/overlay.html",
                        },
                    ],
                },
                {
                    id: "elements.notifications",
                    section: "elements",
                    title: "Уведомления",
                    items: [
                        {
                            id: "elements.notifications.cookie.notification",
                            title: "Использовании Cookies",
                            href: "/docs/elements/notification/cookie.notification.html",
                        },
                        {
                            id: "elements.notifications.message",
                            title: "Сообщение",
                            href: "/docs/elements/notification/message.html",
                        },
                        {
                            id: "elements.notifications.error",
                            title: "Ошибка",
                            href: "/docs/elements/notification/error.html",
                        },
                        {
                            id: "elements.notifications.success",
                            title: "Успех",
                            href: "/docs/elements/notification/success.html",
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
                            href: "/docs/elements/navigation/navbar.top.html",
                            items: [
                                {
                                    id: "elements.navigations.top.navbar",
                                    title: "Панель навигации",
                                    href: "/docs/elements/navigation/navbar.html",
                                },
                                {
                                    id: "elements.navigations.top.brand",
                                    title: "Брэнд",
                                    href: "/docs/elements/navigation/navbar.brand.html",
                                },
                                {
                                    id: "elements.navigations.top.brand.wrapper",
                                    title: "Брэнд, обертка элемента",
                                    href: "/docs/elements/navigation/navbar.brand.wrapper.html",
                                },
                                {
                                    id: "elements.navigations.top.burger",
                                    title: "Бургер",
                                    href: "/docs/elements/navigation/navbar.burger.html",
                                },
                                {
                                    id: "elements.navigations.top.item",
                                    title: "Элемент",
                                    href: "/docs/elements/navigation/navbar.item.html",
                                },
                                {
                                    id: "elements.navigations.top.item.link",
                                    title: "Ссылка",
                                    href: "/docs/elements/navigation/navbar.item.link.html",
                                },
                                {
                                    id: "elements.navigations.top.item.text",
                                    title: "Текст",
                                    href: "/docs/elements/navigation/navbar.item.text.html",
                                },
                                {
                                    id: "elements.navigations.top.item.devider",
                                    title: "Разделитель",
                                    href: "/docs/elements/navigation/navbar.item.devider.html",
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
                            href: "/docs/elements/various/boolean.labeled.html",
                        },
                        {
                            id: "elements.various.boolean",
                            title: "Булево",
                            href: "/docs/elements/various/boolean.html",
                        },
                        {
                            id: "elements.various.booleans",
                            title: "Булевы",
                            href: "/docs/elements/various/booleans.html",
                        },
                        {
                            id: "elements.various.censored",
                            title: "Скрытое значение",
                            href: "/docs/elements/various/censored.html",
                        },
                        {
                            id: "elements.various.errors.list",
                            title: "Список ошибок",
                            href: "/docs/elements/various/errors.list.html",
                        },
                        {
                            id: "elements.various.indicator",
                            title: "Индикатор",
                            href: "/docs/elements/various/indicator.html",
                        },
                        {
                            id: "elements.various.loader",
                            title: "Загрузка...",
                            href: "/docs/elements/various/loader.html",
                        },
                        {
                            id: "elements.various.progress",
                            title: "Прогресс",
                            href: "/docs/elements/various/progress.html",
                        },
                        {
                            id: "elements.various.select.from.model.on.demand.inline",
                            title: "Выбор из модели по запросу встроенный",
                            href: "/docs/elements/various/select.from.model.on.demand.inline.html",
                        },
                        {
                            id: "elements.various.select.from.model.with.search.modal",
                            title: "Выбор из модели с модальным поиском",
                            href: "/docs/elements/various/select.from.model.with.search.modal.html",
                        },
                        {
                            id: "elements.various.show.one.from.list",
                            title: "Один из списка",
                            href: "/docs/elements/various/show.one.from.list.html",
                        },
                        {
                            id: "elements.various.simple.search.input",
                            title: "Поиск",
                            href: "/docs/elements/various/simple.search.input.html",
                        },
                        {
                            id: "elements.various.tag",
                            title: "Метки",
                            href: "/docs/elements/various/tag.html",
                        },
                        {
                            id: "elements.various.tag.value.list",
                            title: "Список меток и значений",
                            href: "/docs/elements/various/tag.value.list.html",
                        },
                        {
                            id: "elements.various.tag.value",
                            title: "Метка и значение",
                            href: "/docs/elements/various/tag.value.html",
                        },
                        {
                            id: "elements.various.title",
                            title: "Заголовок",
                            href: "/docs/elements/various/title.html",
                        },
                        {
                            id: "elements.various.user.card",
                            title: "Карточка пользователя",
                            href: "/docs/elements/various/user.card.html",
                        },
                    ],
                },
            ],
        },

        {
            id: "form",
            title: "Формы",
            priority: -1,

            items: [
                {
                    id: "form.ui",
                    section: "form",
                    title: "UIForm",
                    href: "/docs/frame/form/UIForm.html",
                },
                {
                    id: "form.not",
                    section: "form",
                    title: "notForm",
                    href: "/docs/frame/form/notForm.html",
                },
                {
                    id: "form.set",
                    section: "form",
                    title: "notFormSet",
                    href: "/docs/frame/form/notFormSet.html",
                },
            ],
        },
        {
            id: "overview",
            title: "Обзор",
            priority: 10,
            place: ["start", "end"],

            href: "./index.html",
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
            items: [
                {
                    id: "frame.index",
                    section: "frame",
                    title: "Обзор",
                    href: "/docs/frame/index.html",
                },
            ],
        },
        {
            id: "network",
            title: "Network",
            place: "end",
            indicator: {
                status: "primary",
                labels: {
                    primary: "On",
                    danger: "Off",
                },
            },
        },
        {
            id: "inbox",
            title: "Почта",
            place: "end",
            tag: {
                id: "tagInbox",
                title: "21",
                color: "success",
                size: "small",
            },
            icon: { font: "envelope", size: "medium" },
        },
        {
            id: "menu",
            title: "Меню",
            place: "end",
            priority: -100,
            items: [
                {
                    id: "menu.inbox",
                    section: "menu",
                    title: "Inbox some long text",
                    icon: { font: "envelope" },
                    tag: {
                        id: "tagInbox",
                        title: "21",
                        color: "success",
                    },
                },
                {
                    id: "menu.profile",
                    section: "menu",
                    title: "Profile",
                    href: "/profile",
                    icon: "user",
                },
                {
                    id: "menu.devider",
                    section: "menu",
                    break: true,
                },
                {
                    id: "menu.login",
                    section: "menu",
                    title: "Login",
                    href: "/login",
                },
            ],
        },
    ];
</script>

<Story
    name="UINavbar 1"
    args={{
        brand: { title: "UINavbar 1", href: "/" },
        class: "is-white is-boxed",
        items: navbarItems,
    }}
/>
<Story
    name="UINavbar 2"
    args={{ title: "UINavbar 2", items: navbarItems, class: "is-black" }}
/>
<Story
    name="UINavbar 3"
    args={{
        title: "UINavbar 3",
        items: navbarItems,
        root: "/root2",
        class: "is-light is-boxed",
    }}
/>
<Story
    name="UINavbar 4"
    args={{
        title: "UINavbar 4",
        class: "is-dark",
        items: navbarItems,
        active: true,
    }}
/>
<Story
    name="UINavbar 5"
    args={{
        title: "UINavbar 5",
        class: "is-primary",
        items: navbarItems,
        active: true,
    }}
/>

<Story
    name="UINavbar 6"
    args={{
        title: "UINavbar 6",
        class: "is-link",
        items: navbarItems,
        active: true,
    }}
/>

<Story
    name="UINavbar 7"
    args={{
        title: "UINavbar 7",
        class: "is-info",
        items: navbarItems,
        active: true,
    }}
/>

<Story
    name="UINavbar 8"
    args={{
        title: "UINavbar 8",
        class: "is-success",
        items: navbarItems,
        active: true,
    }}
/>

<Story
    name="UINavbar 9"
    args={{
        title: "UINavbar 9",
        class: "is-warning",
        items: navbarItems,
        active: true,
    }}
/>

<Story
    name="UINavbar 10"
    args={{
        title: "UINavbar 9",
        class: "is-danger",
        items: navbarItems,
        active: true,
    }}
/>
