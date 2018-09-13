const propDirective = $compile => ({
  restrict: 'E',
  replace: true,
  scope: {
    name: '=',
    parent: '=',
  },
  template: `
  <li class="{{type}} {{expanedCollapsed}}">
    <button type="button" class="expandCollapse"></button>
    <label>{{name}}:</label>
    {{start}}
    <span class='type {{type}} {{editingClass}}'></span>
  </li>`,
  link: {
    pre(scope, element, attrs) {
      let value;

      let typeElement;

      let type;

      const editorHTML = '<object-editor object="parent[name]"></object-editor>';

      let actionButtonHtml = '';

      let inputHTML = '';

      let isArray;

      function create() {
        let childElement;

        value = scope.parent[scope.name];
        type = typeof value;
        inputHTML = '';
        isArray = angular.isArray(value);

        if (value === null) type = 'null';

        scope.expanedCollapsed = 'expanded';
        scope.isContainer = type === 'object';
        scope.isPrimitive = !scope.isContainer || type === 'function';
        scope.isArray = isArray;
        scope.inputType = 'checkbox';
        scope.editingClass = '';
        scope.type = scope.isArray ? 'array' : type;

        if (scope.isPrimitive) {
          scope.textValue = value;
        }

        scope.prefix = '';
        scope.suffix = '';
        scope.start = '';

        if (type === 'object') {
          if (scope.isArray) scope.start = '[';
          else scope.start = '{';
        } else if (type === 'function') {
          scope.start = 'function () {...}';
        } else if (type === 'string') {
          scope.prefix = '"';
          scope.suffix = '"';
          scope.inputType = 'text';
        } else if (type === 'number') {
          scope.inputType = 'number';
        } else if (type === 'boolean') {
          scope.inputType = 'checkbox';
        }

        scope.showInput = () => scope.isPrimitive && (scope.editing || scope.inputType === 'checkbox');

        typeElement = angular.element(element[0].querySelector('.type'));
        typeElement[0].innerHTML = 0;

        if (scope.isPrimitive) {
          inputHTML = `
            <input flex
              type="${scope.inputType}"
              data-ng-model="parent[name]"
              ng-switch-case="isBoolean"
            />
          `;
        }

        actionButtonHtml = type === 'function'
          ? `
            <button type="button" class="run" title="run">Run</button>
            <button type="button" class="runWithParams" title="runWithParams">
              Run with arguments
            </button>
          `
          : `
            <button type="button" class="duplicate" title="Duplicate">Duplicate</button>
            <button type="button" name="delete" class="delete" title="Delete"></button>
          `;

        typeElement.html(
          `<div row nowrap>
            <i>{{prefix}}</i>
            ${inputHTML}
            <span class='textValue'>{{parent[name]}}</span>
            <i>{{suffix}}</i>
            ${actionButtonHtml}
          </div>`
        );

        $compile(typeElement.contents())(scope);

        angular.element(element[0].querySelector('span.textValue, .duplicate')).unbind('click');
        element.find('input').unbind('blur');

        if (type === 'string' || type === 'number') {
          angular.element(element[0].querySelector('span.textValue'))
            .bind('click', () => {
              scope.editing = true;
              scope.editingClass = 'editing';
              scope.$apply();
            });

          element
            .find('input')
            .bind('blur', (e) => {
              e.srcElement.focus();
              scope.editingClass = '';
              scope.editing = false;
              scope.$apply();
            })
            .bind('submit', e => e.preventDefault())
            .bind('keydown', (e) => {
              if (e.key === 'Enter') e.preventDefault();
            });
        }

        angular.element(element[0].querySelector('.duplicate')).bind('click', () => {
          let newKeyName;

          if (angular.isArray(scope.parent)) {
            scope.parent.push(angular.copy(scope.parent[scope.name]));
          } else {
            newKeyName = prompt('Property Name');
            if (newKeyName) {
              scope.parent[newKeyName] = angular.copy(scope.parent[scope.name]);
            }
          }

          scope.$parent.objectChange();
        });

        angular.element(element[0].querySelector('.run')).bind('click', () => {
          scope.parent[scope.name].call(scope.parent[scope.name]);
        });

        angular.element(element[0].querySelector('.runWithParams')).bind('click', () => {
          const args = prompt('arguments (comma delimited)') || '';
          scope.parent[scope.name].apply(scope.parent[scope.name], args.split(','));
        });

        childElement = angular.element(element[0].querySelector('ul.objecteditor'));
        if (childElement.length) {
          childElement.remove();
          angular.element(element[0].querySelector('.end')).remove();
        }

        if (typeof value === 'object') {
          $compile(editorHTML)(scope, (cloned, scope) => {
            element.append(cloned);
            element.append(
              angular
                .element('<span/>')
                .addClass('end')
                .addClass(type)
                .text(isArray ? ']' : '}')
            );
          });
        }
      }

      create();

      function expandCollapse() {
        if (scope.expanedCollapsed === 'expanded') {
          scope.expanedCollapsed = 'collapsed';
        } else {
          scope.expanedCollapsed = 'expanded';
        }

        scope.$apply();
      }

      angular.element(element[0].querySelector('.expandCollapse')).bind('click', expandCollapse);
      element
        .find('label')
        .eq(0)
        .bind('dblclick', expandCollapse);

      scope.$watch('editing', (isEditing) => {
        if (isEditing) {
          setTimeout(() => {
            element.find('input')[0].focus();
            element.find('input')[0].select();
          }, 1);
        }
      });

      angular.element(element[0].querySelector('.delete')).bind('click', () => {
        if (angular.isArray(scope.parent)) {
          scope.parent.splice(Number(scope.name), 1);
        } else {
          delete scope.parent[scope.name];
        }

        scope.$parent.objectChange();
      });

      scope.$watch('parent[name]', (newVal) => {
        const newType = typeof newVal;

        const newIsArray = angular.isArray(newVal);

        if (newType !== type || newIsArray !== isArray) {
          create();
        }
      });
    },
  },
});

propDirective.$inject = ['$compile'];

export const moduleName = 'objectEditor';
export const directiveName = 'objectEditor';

angular
  .module(moduleName, [])
  .directive(directiveName, () => ({
    restrict: 'E',
    replace: true,
    scope: {
      object: '=',
    },
    template: `<ul class="object-editor">
      <property ng-repeat="key in keys" name="key" parent="object"></property>
      <li data-ng-show="exists" class="addSection">
        <button type="button" class="add">Add {{addSubject}}</button>
      </li>
    </ul>`,
    link: {
      pre(scope, element) {
        scope.exists = typeof scope.object === 'object';

        scope.addSubject = angular.isArray(scope.object) ? 'Value' : 'Property';

        let $menu = angular.element(document.getElementById('objecteditor-types-menu'));

        function bodyClick(e) {
          if ($menu.find(angular.element(e.target)).length === 0) {
            // $menu[0].style.display = "none";
            angular.element(document.body).unbind('click', bodyClick);
          }
        }

        // create menu
        if (!$menu.length) {
          $menu = angular.element('<ul/>').attr('id', 'objecteditor-types-menu');
          $menu
            .append(
              angular
                .element('<li/>')
                .data('type', 'object')
                .text('Object')
            )
            .append(
              angular
                .element('<li/>')
                .data('type', 'array')
                .text('Array')
            )
            .append(
              angular
                .element('<li/>')
                .data('type', 'string')
                .text('String')
            )
            .append(
              angular
                .element('<li/>')
                .data('type', 'number')
                .text('Number')
            )
            .append(
              angular
                .element('<li/>')
                .data('type', 'boolean')
                .text('Boolean')
            );

          angular.element(document.body).append($menu);

          $menu.on('click', (e) => {
            let val;

            const type = angular.element(e.target).data('type');

            if (type === 'object') val = {};
            else if (type === 'array') val = [];
            else if (type === 'string') val = '';
            else if (type === 'number') val = 0;
            else if (type === 'boolean') val = false;

            $menu[0].style.display = 'none';
            angular.element(document.body).unbind('click', bodyClick);
            $menu.data('itemSelection')(val);
          });
        }

        angular.element(element[0].querySelector('.add')).on('click', function () {
          const $addButton = angular.element(this);

          // show the menu
          const rect = this.getBoundingClientRect();
          $menu[0].style.top = `${rect.top + rect.height}px`;
          $menu[0].style.left = `${rect.left}px`;
          $menu[0].style.display = 'block';

          function itemSelected(val) {
            let newKeyName;

            if (angular.isArray(scope.object)) {
              scope.object.push(val);
            } else {
              newKeyName = prompt('Property Name');
              if (newKeyName) {
                scope.object[newKeyName] = val;
              }
            }
            scope.objectChange();

            $menu.data('itemSelection', null);
          }

          $menu.data('itemSelection', itemSelected);
          angular.element(document.body).bind('click', bodyClick);
          return false;
        });

        scope.$watch(
          'object',
          () => {
            if (scope.object && typeof scope.object === 'object') {
              scope.keys = Object.keys(scope.object);
              scope.exists = typeof scope.object === 'object';
            }
          },
          true
        );

        scope.objectChange = () => {
          scope.keys = Object.keys(scope.object);
          scope.$apply();
        };
      },
    },
  }))
  .directive('property', propDirective);
