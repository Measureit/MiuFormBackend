import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'client/app/shared/shared.module';
import { PreviewReportRoutingModule } from './preview-report-routing.module';
//from packages.json "ngx-extended-pdf-viewer": "^8.3.0",
//from angular.json
              // {
              //   "glob": "**/*",
              //   "input": "node_modules/ngx-extended-pdf-viewer/assets/",
              //   "output": "/assets/"
              // },
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

import { PreviewReportComponent } from './preview-report.component';


@NgModule({
  declarations: [PreviewReportComponent],
  imports: [
    CommonModule,
    NgxExtendedPdfViewerModule,
    PreviewReportRoutingModule,
    SharedModule
  ]
})
export class PreviewReportModule {}
