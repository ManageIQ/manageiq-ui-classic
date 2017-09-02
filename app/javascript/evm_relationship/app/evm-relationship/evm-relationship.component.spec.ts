import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvmRelationshipComponent } from './evm-relationship.component';

describe('EvmRelationshipComponent', () => {
  let component: EvmRelationshipComponent;
  let fixture: ComponentFixture<EvmRelationshipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvmRelationshipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvmRelationshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
