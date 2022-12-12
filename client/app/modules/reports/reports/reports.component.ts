import { Component, OnInit } from '@angular/core';
import { first, map, mergeMap, Observable, tap } from 'rxjs';
import { FactoryInfoConfig, Report } from 'client/app/core/models';
import { ReportService } from 'client/app/core/services';
import { Router } from '@angular/router';

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
    private router: Router) { }

  ngOnInit(): void {
    this.reloadFactories(false)//this.loadFactoryWithNoActive)
      .pipe(
        mergeMap(x => this.reloadReports()),
        first()
      )
      .subscribe();  
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
