import 'angular-mocks';
import getGridChecks from '../../packs/toolbar-actions-common';
import { onCustomAction } from '../../toolbar-actions/custom-action';

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
    let add_flash; // eslint-disable-line camelcase

    beforeEach(() => {
      spyOn(window.vanillaJsAPI, 'post').and.returnValue(Promise.resolve({
        results: [
          { success: true, message: 'some' },
        ],
      }));
      add_flash = jasmine.createSpy('add_flash'); // eslint-disable-line camelcase
      window.add_flash = add_flash; // eslint-disable-line camelcase
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
          jasmine.objectContaining(payload),
        );
    });

    test('should call correct functions', (done) => {
      const payload = {
        action: 'some-action',
        resources: [{ id: 'rr' }, { id: '5' }],
      };
      onCustomAction({ action: payload.action, entity: 'some-entity' }, payload.resources)
        .then(() => {
          expect(add_flash).toHaveBeenCalledWith('Requested some-action of selected item.', 'success');
          done();
        });
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
