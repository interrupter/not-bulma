if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input datetime in tz",
        props: [
            {
                placeholder: "some datetime in tz, offset 0",
                timezoneOffset: 0,
                onchange({ field, value }, event) {
                    console.log("change", field, value, event);
                },
            },
            {
                placeholder: "some datetime in tz, offset 60",
                timezoneOffset: 60,
                readonly: true,
                onchange({ field, value }, event) {
                    console.log("change", field, value, event);
                },
            },

            {
                placeholder: "some datetime in tz, offset 120",
                timezoneOffset: 120,
                onchange({ field, value }, event) {
                    console.log("change", field, value, event);
                },
            },

            {
                placeholder: "some datetime in tz, offset -60",
                timezoneOffset: -60,
                onchange({ field, value }, event) {
                    console.log("change", field, value, event);
                },
            },

            {
                placeholder: "some datetime in tz, offset -120",
                timezoneOffset: -120,
                readonly: true,
                onchange({ field, value }, event) {
                    console.log("change", field, value, event);
                },
            },
        ],
    },
];

window.EXAMPLES.UIDatetimeInTZ = {
    constructor: "Elements.Inputs.UIDatetimeInTZ",
    list: Examples,
};
