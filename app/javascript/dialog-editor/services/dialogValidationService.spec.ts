import DialogValidation from './dialogValidationService';

describe('DialogValidation test', () => {
  let dialogValidation;
  let dialogData;

  beforeEach(() => {
    angular.mock.inject(() => {
      dialogValidation = new DialogValidation();
    });

  });

  describe('#dialogIsValid validations for dialog', () => {
    describe('when a dialog has no label', () => {
      it('returns `false` and sets an error message', () => {
        dialogData = [{
          name: 'Larry\'s dialog',
          dialog_tabs: [{
            name: 'tab 1',
            dialog_groups: []
          }]
        }];
        expect(dialogValidation.dialogIsValid(dialogData)).toEqual(false);
        expect(dialogValidation.invalid.message).toEqual('Dialog needs to have a label');
      });
    });
    describe('when a dialog has no tab', () => {
      it('returns `false` and sets an error message', () => {
        dialogData = [{
          label: 'this is a testing dialog and shouldn\'t be taken seriously',
          name: 'Larry\'s dialog',
          dialog_tabs: []
        }];
        expect(dialogValidation.dialogIsValid(dialogData)).toEqual(false);
        expect(dialogValidation.invalid.message).toEqual('Dialog needs to have at least one tab');
      });
    });
  });
  describe('#dialogIsValid validations for tab', () => {
    describe('when a tab has no label', () => {
      it('returns `false` and sets an error message', () => {
        dialogData = [{
          label: 'this is a testing dialog and shouldn\'t be taken seriously',
          name: 'Larry\'s dialog',
          dialog_tabs: [{
            dialog_groups: [{
            }]
          }]
        }];
        expect(dialogValidation.dialogIsValid(dialogData)).toEqual(false);
        expect(dialogValidation.invalid.message).toEqual('Dialog tab needs to have a label');
      });
    });
    describe('when a tab has no group', () => {
      it('returns `false` and sets an error message', () => {
        dialogData = [{
          label: 'this is a testing dialog and shouldn\'t be taken seriously',
          name: 'Larry\'s dialog',
          dialog_tabs: [{
            label: 'New tab',
            dialog_groups: []
          }]
        }];
        expect(dialogValidation.dialogIsValid(dialogData)).toEqual(false);
        expect(dialogValidation.invalid.message).toEqual('Dialog tab needs to have at least one section');
      });
    });
  });
  describe('#dialogIsValid validations for group', () => {
    describe('when a group has no label', () => {
      it('returns `false` and sets an error message', () => {
        dialogData = [{
          label: 'this is a testing dialog and shouldn\'t be taken seriously',
          name: 'Larry\'s dialog',
          dialog_tabs: [{
            label: 'New tab',
            dialog_groups: [{
              dialog_fields: [{
                label: 'Field'
              }]
            }]
          }]
        }];
        expect(dialogValidation.dialogIsValid(dialogData)).toEqual(false);
        expect(dialogValidation.invalid.message).toEqual('Dialog section needs to have a label');
      });
    });
    describe('when a group has no fields', () => {
      it('returns `false` and sets an error message', () => {
        dialogData = [{
          label: 'this is a testing dialog and shouldn\'t be taken seriously',
          name: 'Larry\'s dialog',
          dialog_tabs: [{
            label: 'New tab',
            dialog_groups: [{
              label: 'Group 1',
              dialog_fields: []
            }]
          }]
        }];
        expect(dialogValidation.dialogIsValid(dialogData)).toEqual(false);
        expect(dialogValidation.invalid.message).toEqual('Dialog section needs to have at least one field');
      });
    });
  });
  describe('#dialogIsValid validations for field', () => {
    describe('when a field has no name', () => {
      it('returns `false` and sets an error message', () => {
        dialogData = [{
          label: 'this is a testing dialog and shouldn\'t be taken seriously',
          name: 'Larry\'s dialog',
          dialog_tabs: [{
            label: 'New tab',
            dialog_groups: [{
              label: 'Group 1',
              dialog_fields: [{
                label: 'Field A',
              }]
            }]
          }]
        }];
        expect(dialogValidation.dialogIsValid(dialogData)).toEqual(false);
        expect(dialogValidation.invalid.message).toEqual('Dialog field needs to have a name');
      });
    });
    describe('when a field has no label', () => {
      it('returns `false` and sets an error message', () => {
        dialogData = [{
          label: 'this is a testing dialog and shouldn\'t be taken seriously',
          name: 'Larry\'s dialog',
          dialog_tabs: [{
            label: 'New tab',
            dialog_groups: [{
              label: 'Group 1',
              dialog_fields: [{
                name: 'Field A name',
              }]
            }]
          }]
        }];
        expect(dialogValidation.dialogIsValid(dialogData)).toEqual(false);
        expect(dialogValidation.invalid.message).toEqual('Dialog field needs to have a label');
      });
    });
    describe('when a non-dynamic dropdown has no entries', () => {
      it('returns `false` and sets an error message', () => {
        dialogData = [{
          label: 'this is a testing dialog and shouldn\'t be taken seriously',
          name: 'Larry\'s dialog',
          dialog_tabs: [{
            label: 'New tab',
            dialog_groups: [{
              label: 'Group 1',
              dialog_fields: [{
                name: 'Field A name',
                label: 'Field A',
                type: 'DialogFieldDropDownList',
                values: []
              }]
            }]
          }]
        }];
        expect(dialogValidation.dialogIsValid(dialogData)).toEqual(false);
        expect(dialogValidation.invalid.message).toEqual('Dropdown needs to have entries');
      });
    });
    describe('when a non-dynamic dropdown has entries', () => {
      it('returns `true`', () => {
        dialogData = [{
          label: 'this is a testing dialog and shouldn\'t be taken seriously',
          name: 'Larry\'s dialog',
          dialog_tabs: [{
            label: 'New tab',
            dialog_groups: [{
              label: 'Group 1',
              dialog_fields: [{
                name: 'Field A name',
                label: 'Field A',
                type: 'DialogFieldDropDownList',
                values: [['a', 'A'], ['b', 'B']]
              }]
            }]
          }]
        }];
        expect(dialogValidation.dialogIsValid(dialogData)).toEqual(true);
      });
    });
    describe('when a dynamic dropdown has no entries', () => {
      it('returns `true`', () => {
        dialogData = [{
          label: 'this is a testing dialog and shouldn\'t be taken seriously',
          name: 'Larry\'s dialog',
          dialog_tabs: [{
            label: 'New tab',
            dialog_groups: [{
              label: 'Group 1',
              dialog_fields: [{
                name: 'Field A name',
                label: 'Field A',
                type: 'DialogFieldDropDownList',
                values: [],
                dynamic: true,
                resource_action: {
                  ae_class: 'Generic_Dynamic_Dialogs',
                },
              }]
            }]
          }]
        }];
        expect(dialogValidation.dialogIsValid(dialogData)).toEqual(true);
      });
    });
    describe('when a tag control has no entries set', () => {
      it('returns `false` and sets an error message', () => {
        dialogData = [{
          label: 'this is a testing dialog and shouldn\'t be taken seriously',
          name: 'Larry\'s dialog',
          dialog_tabs: [{
            label: 'New tab',
            dialog_groups: [{
              label: 'Group 1',
              dialog_fields: [{
                name: 'Field A name',
                label: 'Field A',
                type: 'DialogFieldTagControl',
                category_id: '',
              }]
            }]
          }]
        }];
        expect(dialogValidation.dialogIsValid(dialogData)).toEqual(false);
        expect(dialogValidation.invalid.message).toEqual('Category needs to be set for TagControl field');
      });
    });
  });
});
