import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationMessageComponent } from './operation-message.component';

describe('OperationMessageComponent', () => {
  let component: OperationMessageComponent;
  let fixture: ComponentFixture<OperationMessageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OperationMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OperationMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
