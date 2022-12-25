import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreviewReportComponent } from './preview-report.component';

const routes: Routes = [
  { path: ':id', pathMatch: 'full',
    component: PreviewReportComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreviewReportRoutingModule {}
