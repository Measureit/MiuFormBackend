import { Injectable } from '@angular/core';
import { Observable, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from './console.logger.service';
import { ChecklistItemConfigRepository, DeliveryConfigRepository, FactoryInfoConfigRepository, InspectorInfoRepository, ReportRepository } from './repository';

export interface DbSizeInfo {
  name: string;
  info: string;
}

@Injectable({
  providedIn: 'root',
})
export class DbInspectionService  {
  private readonly dbReportRepo: ReportRepository;
  private readonly dbChecklistItemRepo: ChecklistItemConfigRepository;
  private readonly dbFactoryInfoConfigRepo: FactoryInfoConfigRepository;
  private readonly dbDeliveryConfigRepo: DeliveryConfigRepository;
  private readonly dbInspectorInfoRepo: InspectorInfoRepository;

  constructor(
    private logger: Logger
    ) {
    this.dbReportRepo = new ReportRepository(logger);
    this.dbChecklistItemRepo = new ChecklistItemConfigRepository(logger);
    this.dbFactoryInfoConfigRepo = new FactoryInfoConfigRepository(logger);
    this.dbDeliveryConfigRepo = new DeliveryConfigRepository(logger);
    this.dbInspectorInfoRepo = new InspectorInfoRepository(logger);
  }

  getDbSize(): Observable<DbSizeInfo[]> {
    return zip(
      this.dbChecklistItemRepo.getDbInfo(),
      this.dbInspectorInfoRepo.getDbInfo(),
      this.dbDeliveryConfigRepo.getDbInfo(),
      this.dbFactoryInfoConfigRepo.getDbInfo(),
      this.dbReportRepo.getDbInfo()
    )
    .pipe(
      map(x => [
        { name: 'checklist', info: x[0] } as DbSizeInfo,
        { name: 'inspectorinfo', info: x[1] } as DbSizeInfo,
        { name: 'deliveryConfig', info: x[2] } as DbSizeInfo,
        { name: 'factoryInfo', info: x[3] } as DbSizeInfo,
        { name: 'report', info: x[4] } as DbSizeInfo,
      ])
    );
  }

  compactDb(): Observable<boolean> {
    return zip(
      this.dbChecklistItemRepo.compact(),
      this.dbInspectorInfoRepo.compact(),
      this.dbDeliveryConfigRepo.compact(),
      this.dbFactoryInfoConfigRepo.compact(),
      this.dbReportRepo.compact()
    )
    .pipe(
      map(x => x[0] && x[1] && x[2] && x[3] && x[4])
    );
  }
}


