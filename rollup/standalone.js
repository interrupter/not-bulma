import commonjs from "@rollup/plugin-commonjs";
import svelte from "rollup-plugin-svelte";
import babel from "rollup-plugin-babel";
import postcss from "rollup-plugin-postcss";
import resolve from "@rollup/plugin-node-resolve";
import filesize from "rollup-plugin-filesize";

export default {
    input: "src/index.js",
    output: {
        name: "notBulma",
        format: "iife",
        file: "dist/notBulma.js",
        sourcemap: false,
    },
    plugins: [
        svelte({
            emitCss: true,
        }),
        resolve({
            browser: true,
            preferBuiltins: true,
            dedupe: (importee) =>
                importee === "svelte" || importee.startsWith("svelte/"),
        }),
        commonjs(),
        postcss({
            extract: true,
            minimize: true,
            use: [
                [
                    "sass",
                    {
                        includePaths: ["./node_modules"],
                    },
                ],
            ],
        }),
        process.env.ENV !== "test" &&
            process.env.ENV !== "debug" &&
            babel({
                presets: [
                    [
                        "@babel/preset-env",
                        {
                            corejs: 3,
                            modules: false,
                            useBuiltIns: "usage",
                            targets: "> 2.5%, not dead",
                        },
                    ],
                ],
                babelrc: false,
                runtimeHelpers: true,
                plugins: [
                    "@babel/plugin-proposal-private-methods",
                    "@babel/plugin-proposal-class-properties",
                    "@babel/transform-arrow-functions",
                    /*[
            "@babel/transform-runtime",{
              "regenerator": true,
            }
          ]*/
                ],
                exclude: [
                    "tmpl/**",
                    "build/**",
                    "node_modules/**",
                    "css/**",
                    "js/**",
                    "test/**",
                    "bower_components/**",
                    "assets/*",
                    "dist/**",
                ],
            }) /*,
    (process.env.ENV === 'test' && istanbul({
      extensions: ['.js', '.svelte'],
      compact: false,
      debug: true,
      exclude: ['rollup', 'cypress', 'node_modules/**', 'node_modules/@babel/runtime/helpers/**', 'node_modules/@babel/runtime/regenerator/**', 'node_modules/regenerator-runtime/**']
    }))*/,
        filesize(),
    ],
};
