import 'angular-mocks';
import * as toolbarActions from '../packs/toolbar-actions';

describe('Toolbar actions', () => {
  beforeEach(() => {
    angular.mock.module('miq.api');
  });

  describe('divideNames', () => {
    it('should count success and failures', () => {
      const messageCount = toolbarActions.generateMessages([
        { success: false, message: 'Some message' },
        { success: false, message: 'Some message' },
        { success: true, message: 'Some message' },
        { success: true, message: 'Some message' },
      ]);
      expect(messageCount).toEqual({ 'false': 2, 'true': 2 });
    });

    it('should have empty items for wrong messages', () => {
      const messageCount = toolbarActions.generateMessages([
        { message: 'No success' },
      ]);
      expect(messageCount).toEqual({ 'false': 0, 'true': 0 });
    });
  });

  describe('showMessage', () => {
    let addFlash;

    beforeEach(() => {
      addFlash = jasmine.createSpy('add_flash');
      window.add_flash = addFlash;
      window.sprintf = jasmine.createSpy('sprintf').and.callFake(window.sprintf);
    });

    it('calls show message with string message', () => {
      toolbarActions.showMessage('some message', false);
      expect(addFlash).toHaveBeenCalledWith('some message', 'error');
      toolbarActions.showMessage('some message 2', true);
      expect(addFlash).toHaveBeenCalledWith('some message 2', 'success');
    });

    it('calls show message with object', () => {
      toolbarActions.showMessage({ false: 1, true: 4 });
      expect(window.sprintf).toHaveBeenCalled();
      expect(addFlash).toHaveBeenCalledWith('Deleting of 4 items queued.', 'success');
      expect(addFlash).toHaveBeenCalledWith('Failed to delete 1 items.', 'error');
    });
  });
});
