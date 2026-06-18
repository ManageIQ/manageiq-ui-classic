import * as deleteActions from '../../toolbar-actions/delete';
import { getGridChecks } from '../../toolbar-actions/util.js';

global.jasmine = {};
import '../helpers/angular';
require('angular-mocks');

describe('Toolbar actions', () => {
  beforeEach(() => {
    angular.mock.module('miq.api');
  });

  describe('gridChecks', () => {
    beforeEach(() => {
      window.ManageIQ.gridChecks = [];
    });

    it('should use ManageIQ.gridChecks if any present', () => {
      window.ManageIQ.gridChecks = ['something', '15586'];
      expect(getGridChecks()).toEqual([{ id: 'something' }, { id: '15586' }]);
    });

    it('should use ManageIQ.record if no gridChecks', () => {
      window.ManageIQ.record = { recordId: 'something' };
      expect(getGridChecks()).toEqual([{ id: 'something' }]);
    });
  });

  describe('divideNames', () => {
    it('should count success and failures', () => {
      const messageCount = deleteActions.generateMessages([
        { success: false, message: 'Some message' },
        { success: false, message: 'Some message' },
        { success: true, message: 'Some message' },
        { success: true, message: 'Some message' },
      ]);
      expect(messageCount).toEqual({ false: 2, true: 2 });
    });

    it('should have empty items for wrong messages', () => {
      const messageCount = deleteActions.generateMessages([
        { message: 'No success' },
      ]);
      expect(messageCount).toEqual({ false: 0, true: 0 });
    });
  });

  describe('showMessage', () => {
    const addFlash = jest.fn();

    beforeEach(() => {
      window.add_flash = addFlash;
      window.sprintf = jest.fn().mockImplementation(window.sprintf);
    });

    it('calls show message with object', () => {
      deleteActions.showMessage({ false: 1, true: 4 }, { single: 'Some', multiple: 'Somes' });
      expect(window.sprintf).toHaveBeenCalled();
      expect(addFlash).toHaveBeenCalledWith('Delete initiated for 4 Somes.', 'success');
      expect(addFlash).toHaveBeenCalledWith('Failed to delete 1 Some.', 'error');
    });
  });
});
