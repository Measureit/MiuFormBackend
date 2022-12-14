import { Injectable } from '@angular/core';
import { first, map, Observable, of } from 'rxjs';
import { ChecklistItemConfig, FactoryInfoConfig, Report } from '../models';
import { Logger } from './console.logger.service';
import { ReportGeneratorService } from './report-generator.service';
import { ChecklistItemConfigRepository, DeliveryConfigRepository, FactoryInfoConfigRepository, ReportRepository } from "./repository";

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
  
  private readonly dbChecklistItemRepo: ChecklistItemConfigRepository;
  private readonly dbFactoryInfoConfigRepo: FactoryInfoConfigRepository;
  private readonly dbReportRepo: ReportRepository;

  constructor(
    private logger: Logger,
    private reportGeneratorService: ReportGeneratorService
  ) {
    this.dbChecklistItemRepo = new ChecklistItemConfigRepository(logger);
    this.dbFactoryInfoConfigRepo = new FactoryInfoConfigRepository(logger);
    this.dbReportRepo = new ReportRepository(logger);
  }

  getFactories() : Observable<FactoryInfoConfig[]> {
    return this.dbFactoryInfoConfigRepo.get(false);
  }

  getChecklist() : Observable<ChecklistItemConfig[]> {
    return this.dbChecklistItemRepo.get(false)
      .pipe(
        map(x => {
          let result = x.sort((x, y) => x.order - y.order);
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

  getFiltered(productFilter: string, selectedFactoryIds: string[]) : Observable<Report[]> {
    return this.dbReportRepo.getFiltered(productFilter, selectedFactoryIds);
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
