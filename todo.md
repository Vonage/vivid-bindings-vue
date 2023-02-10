# build & publish `@vonage/vivid-bindings-vue` package
# resolve fonts delivery dilemma between public / private package
# handle vivid components events contracts
# handle Vivid consts enums like ButtonConnotation, ButtonShape, IconConnotation, etc.
# proper vivid init logic add css class to the root app, init fonts, load styles
# Provide `isCustomElement` logic from the `@vonage/vivid-bindings-vue` package
```ts
          compilerOptions: {
            isCustomElement: (tag) => {
              // provide this logic from the `@vonage/vivid-bindings-vue` package
              return tag.startsWith('vvd-')
            }
          },
```

