# vivid-bindings-vue
Fully automated typescript bindings for Vivid web components to be used in VueJS

# Rationale

* Vivid web components since version 3.0 are shipped with the meta data alongside the code itself.
  Which allows to employ code generation practice to build **100% automated** typescript type safe bindings for VueJs components
* Adds an abstraction layer to mitigate the custom web components namespacing conflicts issue, to enable usage of several major versions of Vivid components in the single application more info [here](https://vivid.deno.dev/#advanced-usage), and how Salesforce Lightning web components are solving that issue [here](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.create_components_namespace)


# Manual bindings approach
https://github.com/Vonage/vivid-vue

