#!/bin/bash
echo 'building for' $ENV 'environment'
rm -rf ./dist/*
NODE_ENV=$ENV ./node_modules/.bin/eslint ./src/**.js
NODE_ENV=$ENV ./node_modules/.bin/rollup -c ./rollup/standalone.js --environment ENV:$ENV
NODE_ENV=$ENV ./node_modules/.bin/terser --compress --mangle -- dist/notBulma.js > ./dist/notBulma.min.js
if [[ $ENV == 'test' ]]
then
cp node_modules/not-error/build/bundle.min.js examples/dist/assets/not-error
cp dist/notBulma.js test/browser/assets/bulma
cp dist/notBulma.min.js test/browser/assets/bulma
cp dist/notBulma.css test/browser/assets/bulma
fi

if [[ $ENV == 'development' ]]
then
cp node_modules/not-error/build/bundle.min.js examples/dist/assets/not-error
cp dist/notBulma.js examples/dist/assets/not-bulma
cp dist/notBulma.min.js examples/dist/assets/not-bulma
cp dist/notBulma.css examples/dist/assets/not-bulma
fi

exit 0;
