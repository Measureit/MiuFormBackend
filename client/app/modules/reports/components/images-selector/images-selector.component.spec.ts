import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesSelectorComponent } from './images-selector.component';

describe('ImagesSelectorComponent', () => {
  let component: ImagesSelectorComponent;
  let fixture: ComponentFixture<ImagesSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImagesSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagesSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
