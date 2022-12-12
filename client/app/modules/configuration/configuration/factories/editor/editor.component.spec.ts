import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactoryEditorComponent } from './editor.component';

describe('EditorComponent', () => {
  let component: FactoryEditorComponent;
  let fixture: ComponentFixture<FactoryEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FactoryEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactoryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
