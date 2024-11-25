import globals from "globals";
import babelParser from "@babel/eslint-parser";
import parser from "svelte-eslint-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

const GLOBALS_BROWSER_FIX = Object.assign({}, globals.browser, {
    AudioWorkletGlobalScope: globals.browser["AudioWorkletGlobalScope "],
});

delete GLOBALS_BROWSER_FIX["AudioWorkletGlobalScope "];

export default [
    {
        ignores: [
            "**/node_modules",
            "node_modules/**/*",
            "coverage/**/*",
            "docs/**/*",
            "test/**/*",
            "**/*.scss",
            "**/*.css",
        ],
    },
    ...compat.extends(
        "eslint:recommended",
        "plugin:storybook/recommended",
        "plugin:svelte/recommended"
    ),
    {
        plugins: {},
        languageOptions: {
            globals: {
                ...GLOBALS_BROWSER_FIX,
                ...globals.mongo,
                ...globals.mocha,
                ENV: true,
            },

            parser: babelParser,
            ecmaVersion: 2022,
            sourceType: "script",

            parserOptions: {
                requireConfigFile: false,
                sourceType: "module",
            },
        },

        rules: {
            indent: [
                "error",
                4,
                {
                    SwitchCase: 1,
                },
            ],

            "linebreak-style": ["error", "unix"],
            semi: ["error", "always"],
            "no-useless-escape": [0],
        },
    },
    {
        files: ["**/*.svelte", "**/*.js"],

        languageOptions: {
            parser: parser,
        },
    },
];
