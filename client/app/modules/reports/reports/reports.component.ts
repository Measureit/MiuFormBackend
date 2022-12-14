import { Component, OnInit } from '@angular/core';
import { first, map, mergeMap, Observable, tap } from 'rxjs';
import { FactoryInfoConfig, Report } from 'client/app/core/models';
import { ReportService } from 'client/app/core/services';
import { Router } from '@angular/router';
import { UserNotificationService } from 'client/app/core/services/user-notification.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  loadFactoryWithNoActive: boolean = false;
  factoryItems: FactoryInfoConfig[] = [];
  items: Report[] = [];

  productIdFilter: string = '';

  constructor(private reportService: ReportService, 
    private userNotificationService: UserNotificationService,
    private router: Router) { }

  ngOnInit(): void {
    this.reloadFactories(false)//this.loadFactoryWithNoActive)
      .pipe(
        mergeMap(x => this.reloadReports()),
        first()
      )
      .subscribe({
        error: (err) =>{
          console.error(err);
          this.userNotificationService.notifyError('MESSAGE.LOAD.FAILED');
        } 
      });  
  }

  selectFactoryInfoConfig(id: string): FactoryInfoConfig | undefined {
    return this.factoryItems.find(x => x._id === id);
  }

  reloadReports(): Observable<boolean> {
    return this.reportService.getReports(true)
      .pipe(
        tap(x => this.items = x),
        map(x => true)
      );
  }

  filter() {
    
  }

  clearFilter() {
    
  }

  reloadFactories(loadNoActive: boolean): Observable<boolean> {
    return this.reportService.getFactories()
      .pipe(
        tap(x => this.factoryItems = x),
        map(x => true)
      )      
  }

  preview(event: any, id: string) {    
    this.router.navigate(['/reports/preview', id]);
  }

  prepare(event: any, id: string) {
    event.stopPropagation();
    this.router.navigate(['/reports/prepare', id]);
  }
}
