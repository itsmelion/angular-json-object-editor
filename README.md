# A JSON object editor for AngularJS
Module to edit Javascript Objects (AngularJS/ Angular 1)

### Installation
`npm i -S angularjs-json-object-editor`

### Usage
Include in your project
```js
import { moduleName as objectEditor } from 'angularjs-json-object-editor';
```

Include styles (in your sass file)
```scss
@import 'angularjs-json-object-editor';
```
(or on your .js file)
```js
import 'angularjs-json-object-editor/index.scss';
```

Add to the dependencies of your angular app
```js
angular.module('myApp', [objectEditor]);
```

Use your directive
```html
<object-editor object="$scope.myObject"></object-editor>
```
___