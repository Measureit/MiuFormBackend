import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrepareReportComponent } from './prepare-report.component';

describe('PrepareReportComponent', () => {
  let component: PrepareReportComponent;
  let fixture: ComponentFixture<PrepareReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrepareReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrepareReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
