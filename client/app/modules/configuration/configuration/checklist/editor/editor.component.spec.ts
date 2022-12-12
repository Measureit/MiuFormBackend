import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecklistItemEditorComponent } from './editor.component';

describe('EditorComponent', () => {
  let component: ChecklistItemEditorComponent;
  let fixture: ComponentFixture<ChecklistItemEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChecklistItemEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChecklistItemEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
