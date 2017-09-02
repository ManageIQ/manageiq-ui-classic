
import {EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import {fakeAsync, TestBed, tick } from '@angular/core/testing';
import {Observable } from 'rxjs/Observable';
import {EvmRelationshipService} from './evm-relationship.service';
import {EvmRelationshipEffects} from './evm-relationship.effects';

describe('EvmRelationshipEffects', () => {
  let runner, evmRelationshipEffects, evmRelationshipService;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      EffectsTestingModule
    ],
    providers: [
      EvmRelationshipEffects,
      {
        provide: EvmRelationshipService,
        useValue: jasmine.createSpyObj('evmRelationshipService', ['get'])
      }
    ]
  }));

  beforeEach(() => {
    runner = TestBed.get(EffectsRunner);
    evmRelationshipEffects = TestBed.get(EvmRelationshipEffects);
    evmRelationshipService = TestBed.get(EvmRelationshipService);
  });

  describe('evm-relationship$', () => {

    it('should return a LOAD_SUCCESS action, on success', function () {

    });

    it('should return a LOAD_FAIL action, on error', function () {

    });

  });

});
