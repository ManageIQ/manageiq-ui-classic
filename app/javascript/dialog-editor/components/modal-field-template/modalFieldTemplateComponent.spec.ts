import * as angular from 'angular';

describe('modalFieldTemplateSpec', () => {
  describe('component', () => {
    let scope, compile, template, compiledTemplate;

    beforeEach(() => {
      angular.mock.module('miqStaticAssets.dialogEditor', ($filterProvider) => {
        $filterProvider.register('translate', () => (value) => value);
      });
      angular.mock.inject(($rootScope, $compile: ng.ICompileService) => {
        scope = $rootScope.$new();
        compile = $compile;
      });

      scope.modalTabIsSet = () => true;
      scope.modalTab = 'options';
      scope.modalData = {
        type: 'DialogFieldDropDownList',
        options: {
          sort_by: 'none'
        },
        values: [
          ['aaa', 'AAA'],
          ['bbb', 'BBB'],
          ['ccc', 'CCC'],
          ['ddd', 'DDD'],
          ['eee', 'EEE'],
        ]
      };

      template = angular.element(
        `<dialog-editor-modal-field-template modal-data='modalData'
                                             modal-tab-is-set='modalTabIsSet'
                                             modal-tab='modalTab'
                                             template='drop-down-list.html'>
        </dialog-editor-modal-field-template>`
      );
    });

    it('renders manually sortable fields', () => {
      compiledTemplate = compile(template)(scope);
      scope.$apply();
      expect(compiledTemplate[0].querySelectorAll('.draggable-field').length).toBe(5);
      expect(compiledTemplate[0].querySelectorAll('.static-field').length).toBe(0);
    });

    it('renders unsortable fields', () => {
      scope.modalData.options.sort_by = 'desc';
      compiledTemplate = compile(template)(scope);
      scope.$apply();
      expect(compiledTemplate[0].querySelectorAll('.draggable-field').length).toBe(0);
      expect(compiledTemplate[0].querySelectorAll('.static-field').length).toBe(5);
    });
  });
});
