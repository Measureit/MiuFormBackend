import { Component, OnInit } from '@angular/core';
import { first, map, mergeMap, Observable, of, tap } from 'rxjs';
import { FactoryInfoConfig, Report } from 'client/app/core/models';
import { ReportService } from 'client/app/core/services';
import { Router } from '@angular/router';
import { UserNotificationService } from 'client/app/core/services/user-notification.service';
import { ConfirmDialogComponent, ConfirmDialogModel } from 'client/app/shared/components/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

export interface SelectionItem {
  isSelected: boolean;
}

type RerortWithSelection = Report & SelectionItem;

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  isBackupSelected = false;

  loadFactoryWithNoActive = false;
  factoryItems: FactoryInfoConfig[] = [];
  items: RerortWithSelection[] = [];
  selectedFactoryIds: string[] = [];
  productIdFilter = '';

  constructor(private reportService: ReportService,
    private dialog: MatDialog,
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
    return this.reportService.getFiltered(this.productIdFilter, this.selectedFactoryIds)
      .pipe(
        tap(x => this.items = x.map(y => ({...y, isSelected: false } as RerortWithSelection))),
        map(x => true)
      );
  }

  filter() {
    console.log('filter: ' + JSON.stringify(this.selectedFactoryIds) + ' ' + this.productIdFilter);
    this.reloadReports()
    .pipe(
      first()
    )
    .subscribe({
      error: (err) =>{
        console.error(err);
        this.userNotificationService.notifyError('MESSAGE.LOAD.FAILED');
      }
    });
  }

  clearFilter() {
    this.selectedFactoryIds = [];
    this.productIdFilter = '';
    this.filter();
  }

  reloadFactories(loadNoActive: boolean): Observable<boolean> {
    return this.reportService.getFactories()
      .pipe(
        tap(x => this.factoryItems = x),
        map(x => true)
      );
  }

  preview(event: any, id: string) {
    if (this.isBackupSelected) {return;}
    this.router.navigate(['/reports/preview', id]);
  }

  prepare(event: any, id: string) {
    event.stopPropagation();
    this.router.navigate(['/reports/prepare', id]);
  }

  onBackup(event: any) {
    if (!this.isBackupSelected) {
      this.isBackupSelected = true;
    } else {
      //operate backup backup
      const dialogData = new ConfirmDialogModel('Backup Reports', 'Do you want to backup reports?');

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: '400px',
        data: dialogData
      });

      dialogRef.afterClosed().pipe(
        //make backup
        mergeMap(x => {
          if (x === true) {
            return this.backupReports(this.items.filter(y => y.isSelected));
          } else {
            return of(false);
          }
        }),
        //ask about remove
        mergeMap(x => {
          if (x === true) {
            const dialogDataRemoveReport = new ConfirmDialogModel('Remove Reports', 'Do you want to remove backed up reports?');
            const dialogRefRemoveReport = this.dialog.open(ConfirmDialogComponent, {
              maxWidth: '400px',
              data: dialogDataRemoveReport
            });
            return dialogRefRemoveReport.afterClosed();
          } else {
            return of(false);
          }
        }),
        mergeMap(x => {
          if (x === true) {
            return this.removeReports(this.items.filter(y => y.isSelected));
          } else {
            return of(false);
          }
        })
      ).subscribe();

    }
  }

  backupReports(reports: Report[]): Observable<boolean> {
    //todo:
    console.log('backupReports');
    return of(true);
  }

  removeReports(reports: Report[]): any {
    //todo:
    console.log('removeReports');
    return of(true);
  }

  checkToBackup(event: any, item: RerortWithSelection) {
    item.isSelected = !item.isSelected;
  }

  onCancelBackup(event: any) {
    this.items.forEach(x => x.isSelected = false);
    this.isBackupSelected = false;
  }
}
