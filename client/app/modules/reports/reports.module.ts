import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports/reports.component';
import { PrepareReportComponent } from './prepare-report/prepare-report.component';
import { ReportsRoutingModule } from './reports-routing.module';
import { SharedModule } from 'client/app/shared/shared.module';
import { ImagesSelectorComponent } from './components/images-selector/images-selector.component';
import { ChecklistItemComponent } from './components/checklist-item/checklist-item.component';



@NgModule({
  declarations: [
    ImagesSelectorComponent,
    ChecklistItemComponent,
    ReportsComponent,
    PrepareReportComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    SharedModule
  ]
})
export class ReportsModule { }
