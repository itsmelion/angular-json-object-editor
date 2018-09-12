# A JSON object editor for AngularJS
___
Module to edit Javascript Objects (AngularJS/ Angular 1)

### Installation
`npm i -S ### Installation
`npm i -S angularjs-json-object-editor`

### Usage
Include in your project
`import objectEditor from 'angularjs-json-object-editor';`

Include styles (in your sass file)
`@import 'angularjs-json-object-editor';`
(or on your .js file)
`import 'angularjs-json-object-editor.scss';`


Add to the dependencies of your angular app
```angular
  .module('myApp', ['objectEditor'])```

Use your directive
`<object-editor object="$scope.myObject"></object-editor>`