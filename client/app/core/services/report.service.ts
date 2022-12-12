import { Injectable } from '@angular/core';
import { first, map, mergeMap, Observable, of } from 'rxjs';
import { ChecklistItemConfig, CreateReport, DeliveryConfig, FactoryInfoConfig, Report } from '../models';
import { ConsoleLoggerService, Logger } from './console.logger.service';
import { DBService } from './db.service';
import { ReportGeneratorService } from './report-generator.service';
import { Repository } from "./repository";

export const blobToBase64 = (blob: Blob) : Promise<string> => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  
  private readonly dbChecklistItemRepo: Repository<ChecklistItemConfig>;
  private readonly dbFactoryInfoConfigRepo: Repository<FactoryInfoConfig>;
  private readonly dbDeliveryConfigRepo: Repository<DeliveryConfig>;
  private readonly dbReportRepo: Repository<Report>;

  constructor(
    private dbService: DBService,
    private logger: Logger,
    private reportGeneratorService: ReportGeneratorService
  ) {
    this.dbChecklistItemRepo = new Repository<ChecklistItemConfig>(logger, 'miuapp_ChecklistItem');
    this.dbFactoryInfoConfigRepo = new Repository<FactoryInfoConfig>(logger, 'miuapp_FactoryInfoConfig');
    this.dbDeliveryConfigRepo = new Repository<DeliveryConfig>(logger, 'miuapp_DeliveryConfig');
    this.dbReportRepo = new Repository<Report>(logger, 'miuapp_Report');
  }

  getFactories() : Observable<FactoryInfoConfig[]> {
    return this.dbFactoryInfoConfigRepo.get(false);
  }

  getChecklist() : Observable<ChecklistItemConfig[]> {
    return this.dbChecklistItemRepo.get(false)
      .pipe(
        map(x => {
          let result = x.sort((x, y) => x.order - y.order);
          console.log('getChecklist: ' + JSON.stringify(result));
          return result;
        })
      )
  }

  // createNewReport() : Observable<Report> {
  //   return this.dbChecklistItemRepo.get(false)
  //     .pipe(map(x => CreateReport(x)));
  // }

  getReport(id: string) : Observable<Report> {
    return this.dbReportRepo.getById(id);
  }
  getReports(withNoActive: boolean) : Observable<Report[]> {
    return this.dbReportRepo.get(withNoActive);
  }

  updateReport(report: Report) : Observable<string | undefined> {
    return this.dbReportRepo.update(report);
  }

  generatePdf(report: Report): Observable<Blob> {
    return this.reportGeneratorService.generatePdf(report)
      .pipe(  
        map(pdf => pdf.output('blob')),
        first()
      );
  }

  

  sendReport(report: Report) : Observable<boolean> {
    return of(true);
  }
}
