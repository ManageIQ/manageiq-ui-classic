describe('fieldComponentSpec', () => {
  let bindings;
  describe('controller', () => {
    let fieldComponent;

    beforeEach(() => {
      bindings = {
        fieldData: {default_value: '["one", "two"]'}
      };
      angular.mock.module('miq.dialogEditor');
      angular.mock.inject($componentController => {
        fieldComponent = $componentController('dialogEditorField', null, bindings);
        fieldComponent.$onInit();
      });
    });

    describe('#convertValuesToArray', () => {
      it('converts a string of default values to an array', () => {
        fieldComponent.convertValuesToArray();
        expect(fieldComponent.fieldData.default_value).toEqual(['one', 'two']);
      });
    });
  });
});
