# vivid-bindings-vue

Typescript bindings for [Vivid 3](http://vivid.deno.dev) web components to be used with [VueJS 3](https://vuejs.org)

What's in the box(i.e. batteries included):

* Convergent [Vivid](https://github.com/Vonage/vivid-3) design system initialization routine
* 100% Vivid components covered with bindings
* Almost 100% automated process for NPM package generation & release
* Enhanced DevEx (VS Code intellisense) + Fully sound Typescript type checking for Vivid web components props/events contracts
* Abstraction layer for easier migration between Vivid major versions


## How to integrate with VueJs App

Vivid can be initialized as easy as few lines of code

`main.ts`
```ts
import { createApp } from 'vue'
import App from './App.vue'
import { vivid } from '@vonage/vivid-bindings-vue'

const app = createApp(App)
app.use(vivid, {
  font: 'oss',
  theme: 'dark'
})
app.mount('#app')
```

`vite.config.ts`
```ts
import { isCustomElement } from '@vonage/vivid-bindings-vue'

...

  plugins: [
    vue(
      {
        template: {
          compilerOptions: {
            isCustomElement
          },
        },
      }
    )
  ]

...

```


## How to import components

Each Vivid component should be imported using single import statement.
The Vivid major version is a part of the import `v3`. This enables seamless side by side usage of different major versions in a single project for `pay as you go` future migration path

```vue
<script setup lang="ts">
import { Connotation } from '@vonage/vivid'
import VwcButton from '@vonage/vivid-bindings-vue/v3/VwcButton'
import VwcIcon from '@vonage/vivid-bindings-vue/v3/VwcIcon'

function handleClick(e:PointerEvent) {}
</script>

<template>
  <VwcButton
     iconTrailing
     icon="github-mono"
     @click="handleClick"
     appearance='filled'
     label="I'm a Vivid button" />
  <VwcIcon
     name="key-solid"
     :connotation=Connotation.Alert
     :size=5 />
</template>
```

## Releases

This package has a `pipeline` workflow which is checking for a new Vivid version on a weekly basis and if it detects that new version is out The new bindings are generated and published automatically, reflecting the same package version `@vonage/vivid` has.

## Repository structure

The entire repository is a pure Typescript code, divided onto two main parts
- `./src` - is the [Deno](https://deno.land) territory, contains the generator code, which is effectively generates the NPM package contents on top of the existing template
- `./package` - is the [NPM](https://www.npmjs.com/package/@vonage/vivid-bindings-vue) package template

## Rationale

* Vivid web components since version 3.0 are shipped with the custom elements meta data alongside the code itself.
  Which allows to employ code generation practice to build near **100% automated** typescript type safe bindings for VueJs components
* Adds an abstraction layer to mitigate the custom web components namespacing conflicts issue, to enable usage of several major versions of Vivid components in the single application more info [here](https://vivid.deno.dev/#advanced-usage), and how Salesforce Lightning web components are solving that issue [here](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.create_components_namespace)


## Manually managed opinionated bindings for VueJs 2.x
https://github.com/Vonage/vivid-vue

