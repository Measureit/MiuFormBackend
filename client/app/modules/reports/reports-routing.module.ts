import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrepareReportComponent } from './prepare-report/prepare-report.component';
import { ReportsComponent } from './reports/reports.component';

const routes: Routes = [
  { 
    path: '', 
    component: ReportsComponent 
  },
  { 
    path: 'prepare/:id', 
    component: PrepareReportComponent 
  },
  { 
    path: 'prepare', 
    pathMatch: 'full',
    component: PrepareReportComponent 
  },  
  { 
    path: 'preview', 
    loadChildren: () =>
      import('./preview-report/preview-report.module').then(
        (m) => m.PreviewReportModule       
      )
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
