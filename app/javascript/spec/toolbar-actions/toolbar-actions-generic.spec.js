import { onCustomAction } from '../../toolbar-actions/custom-action';
import { getGridChecks } from '../../toolbar-actions/util.js';
import '../../packs/toolbar-actions-common.js'; // subscribeToRx
global.jasmine = {};
import '../helpers/angular';
import '../helpers/API';
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

  describe('Generic action', () => {
    let add_flash;

    beforeEach(() => {
      jest.spyOn(window.vanillaJsAPI, 'post').mockReturnValue(Promise.resolve({
        results: [
          { success: true, message: 'some' },
        ],
      }));
      add_flash = jest.fn();
      window.add_flash = add_flash;
    });

    test('should send correct data', () => {
      const payload = {
        action: 'some-action',
        resources: [{ id: 'rr' }, { id: '5' }],
      };
      onCustomAction({ action: payload.action, entity: 'some-entity' }, payload.resources);
      expect(window.vanillaJsAPI.post)
        .toHaveBeenCalledWith(
          '/api/some-entity',
          expect.objectContaining(payload),
        );
    });

    test('should call correct functions', async () => {
      const payload = {
        action: 'some-action',
        resources: [{ id: 'rr' }, { id: '5' }],
      };
      await onCustomAction({ action: payload.action, entity: 'some-entity' }, payload.resources);
      expect(add_flash).toHaveBeenCalledWith('Requested some-action of selected item.', 'success');
    });

    test('should react to RX call', () => {
      sendDataWithRx({
        type: 'generic',
        controller: 'toolbarActions',
        payload: { action: 'some-action', entity: 'some-entity' },
      });
      expect(window.vanillaJsAPI.post).toHaveBeenCalled();
    });
  });
});
