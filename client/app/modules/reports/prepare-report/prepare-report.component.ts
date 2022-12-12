import { P, R } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, first, flatMap, from, map, mergeMap, of, tap, zip } from 'rxjs';
import { Logger, ReportService } from 'client/app/core/services';
import { ConfirmDialogComponent, ConfirmDialogModel } from 'client/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ChecklistItemConfig, CreateReport, FactoryInfoConfig, ImageSize, Report, ReportChecklistItem, ReportImageItem } from '../../../core/models';
import { ChecklistComponent } from '../../configuration/configuration/checklist/checklist.component';

interface CompareChecklistInput {
  _id: string;
  order: number;
  content: string;
}

enum CompareChecklistReason {
  ADDED,
  REMOVED,
  CHANGED
}

interface CompareChecklistResult {
  checkListItem: CompareChecklistInput;
  reason: CompareChecklistReason;
}

@Component({
  selector: 'app-prepare-report',
  templateUrl: './prepare-report.component.html',
  styleUrls: ['./prepare-report.component.scss']
})
export class PrepareReportComponent implements OnInit {

  item: Report | undefined = undefined;
  factoryItems: FactoryInfoConfig[] = [];
  checklistItems: ChecklistItemConfig[] = [];
  itemForm: FormGroup | undefined;

  file0src: SafeHtml | undefined; //string | ArrayBuffer;
  loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private logger: Logger,
    private router: Router,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private reportService: ReportService) { }

  ngOnInit(): void {
    this.loading = true;
    this.reportService.getChecklist()
      .pipe(
        tap(cls => this.checklistItems = cls),
        mergeMap(x => this.activatedRoute.params),
        map(params => params['id']),
        mergeMap(id => {
          this.logger.debug(`prepare report for id: ${id}`)
          if (id !== undefined && id !== '') {
            return this.reportService.getReport(id)
              .pipe(
                mergeMap(r => {
                  const compareResult = this.compareChecklist(r.checklist, this.checklistItems);
                  console.log(JSON.stringify(compareResult));
                  if (compareResult.length > 0) {
                    //todo: spytać czy user chce zaktualizowac checkliste
                    return zip(
                      this.translateService.get('PREPARE_REPORT.UPDATE_CHECKLIST_QUESTION_TITLE'),
                      this.translateService.get('PREPARE_REPORT.UPDATE_CHECKLIST_QUESTION')
                    )
                    .pipe(
                      mergeMap(x => {
                        const dialogData = new ConfirmDialogModel(x[0], x[1]);
                    
                        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
                          maxWidth: "400px",
                          data: dialogData
                        });
                    
                        return dialogRef.afterClosed();
                      }),
                      map(x => {
                        if (x === true) {//dialog result
                          r.checklist = this.updateChecklist(r.checklist, compareResult, this.checklistItems);
                        }
                        return r;
                      }),
                      map(r => {
                        return this.reportService.updateReport(r)                        
                      }),
                      mergeMap(x => this.reportService.getReport(id)),
                      first()
                    )                                     
                  }
                  return of(r);
                })
              )
          } else {
            return of(CreateReport(this.checklistItems));
          }
        }),
        tap(r => this.item = r),
        mergeMap(x => {
          if (this.item) {
            this.itemForm = this.formBuilder.group({
            _id: [this.item._id],
            _rev: [this.item._rev],
            dateOfCreation: [this.item.dateOfCreation],
            productId: [this.item.productId, [Validators.required, Validators.minLength(3)]],
            productName: [this.item.productName, [Validators.required, Validators.minLength(3)]],
            productColor: [this.item.productColor, [Validators.required, Validators.minLength(3)]],
            factoryInfoId: [this.item.factoryInfoId, [Validators.required]],
            checklist: this.formBuilder.array(this.item.checklist.map(
              x => this.formBuilder.group({
                checklistItemId: [x.checklistItemId],
                comment: [x.comment],
                order: [x.order],
                pointImages: this.formBuilder.array(x.pointImages.map(
                  x => this.formBuilder.group({ selected: false, ...x })
                )),
                content: [x.content],
                isChecked: [x.isChecked]
              })
            )),
            images: this.formBuilder.array(this.item.images.map(
              x => this.formBuilder.group({ selected: false, ...x })
            )),
            comment: [this.item.comment],
            dateOfDelivery: [this.item.dateOfDelivery]
          
          });
          return this.reportService.getFactories();
        }
        return of([]);
        }),
        tap(facs => this.factoryItems = facs),

        first(),
      ).subscribe({
        next: (x) => {
          console.log('init success');
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  compareChecklist(checklist: ReportChecklistItem[], checklistFromConfig: ChecklistItemConfig[]): CompareChecklistResult[] {
    let checklistToCompare = checklist.map(x => { return { order: x.order, _id: x.checklistItemId, content: x.content } as CompareChecklistInput });
    let checklistFromConfigToCompare = checklistFromConfig.map(x => { return { order: x.order, _id: x._id, content: x.content } as CompareChecklistInput });

    const isSameId = (a: CompareChecklistInput, b: CompareChecklistInput) => a._id === b._id;

    // Get items that only occur in the left array,
    // using the compareFunction to determine equality.
    const onlyInLeft = (left: CompareChecklistInput[], 
      right: CompareChecklistInput[], 
      compareFunction: (a: CompareChecklistInput, b: CompareChecklistInput) => boolean):CompareChecklistInput[] =>
      left.filter(leftValue =>
        !right.some(rightValue =>
          compareFunction(leftValue, rightValue)));

    const wereRemoved = onlyInLeft(checklistToCompare, checklistFromConfigToCompare, isSameId);
    const wereAdded = onlyInLeft(checklistFromConfigToCompare, checklistToCompare, isSameId);

    const checklistToCompareSameId = checklistToCompare.filter(x =>
      !wereRemoved.some(y => y._id === x._id)
      && !wereAdded.some(y => y._id === x._id));
    const checklistFromConfigToCompareSameId = checklistFromConfigToCompare.filter(x =>
      !wereRemoved.some(y => y._id === x._id)
      && !wereAdded.some(y => y._id === x._id));
    const wereChanged = onlyInLeft(checklistToCompareSameId, checklistFromConfigToCompareSameId,
      (a: CompareChecklistInput, b: CompareChecklistInput) => a._id === b._id && a.content === b.content);

    let result: CompareChecklistResult[] = [];
    result = result.concat(wereRemoved.map(x => { return { checkListItem: x, reason: CompareChecklistReason.REMOVED } as CompareChecklistResult}));
    result = result.concat(wereAdded.map(x => { return { checkListItem: x, reason: CompareChecklistReason.ADDED } as CompareChecklistResult}));
    result = result.concat(wereChanged.map(x => { return { checkListItem: x, reason: CompareChecklistReason.CHANGED } as CompareChecklistResult}));
    return result;
  }

  updateChecklist(reportChecklist: ReportChecklistItem[], 
    compareChecklistResults: CompareChecklistResult[], 
    checklistItems: ChecklistItemConfig[]): ReportChecklistItem[] {
    let result = [...reportChecklist];
    compareChecklistResults.forEach(x => {
      switch(x.reason) {
        case CompareChecklistReason.ADDED:
          result.push(ReportChecklistItem.Create({...x.checkListItem} as ChecklistItemConfig));
          break;
        case CompareChecklistReason.REMOVED:
          //todo: result.
          break;
        case CompareChecklistReason.CHANGED:
          let itemToChange = result.find(y => x.checkListItem._id === y.checklistItemId);
          let newItem = checklistItems.find(y => x.checkListItem._id === y._id);
          if (itemToChange && newItem) {
            itemToChange.content = newItem.content;
          }
          break;
      }
    })
    return result;
  }

  get images(): FormArray {
    return this.itemForm?.get('images') as FormArray;
  }

  get checklistItemFormGroups(): FormGroup[] {
    const fa = this.itemForm?.get('checklist') as FormArray;
    return fa.controls.map(x => x as FormGroup);
  }

  getFromFormGroup(): Report {
    return this.itemForm?.getRawValue() as Report;
  }

  preview() {
    let report = this.getFromFormGroup();
    this.reportService.updateReport(report)
      .pipe(
        first()
      )
      .subscribe({
        next: (b) => {
          this.router.navigate(['/reports/preview', report._id]);
        },
        error: (err) => console.error(err)
      });
  }

  saveReport() {
    let report = this.getFromFormGroup();
    this.reportService.updateReport(report)
      .pipe(        
        mergeMap(x => x ? this.reportService.getReport(x) : of(undefined)),
        tap(x => {
          this.item = x;
          if (this.itemForm && this.item) {
            this.itemForm.get('_id')?.setValue(this.item._id);
            this.itemForm.get('_rev')?.setValue(this.item._rev);
          }
        }),
        first(),
      )
      .subscribe({
        next: (x ) => console.log('success'),
        error: (err) => console.error(err)
      });
  }
}
