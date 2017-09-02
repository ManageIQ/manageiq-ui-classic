import { miqReducer } from './reducer';
import * as fromEvmRelationship from './reducer';

describe('Evm RelationshipReducer', () => {

  describe('undefined action', () => {
    it('should return the default state', () => {
      const action = {} as any;

      const result = miqReducer(undefined, action);
      expect(result).toEqual(fromEvmRelationship.INITIAL_STATE);
    });
  });

});
