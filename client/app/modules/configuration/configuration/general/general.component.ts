import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { Form, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TitleStrategy } from '@angular/router';
import { catchError, first, map, mergeMap, of, take, tap } from 'rxjs';
import { CreateDeliveryConfig, DeliveryConfig } from 'client/app/core/models';
import { CreateInspectorInfo, InspectorInfo } from 'client/app/core/models/inspector-info.model';
import { Configuration, ConfigurationService } from 'client/app/core/services';
import { UserNotificationService } from 'client/app/core/services/user-notification.service';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogComponent, ConfirmDialogModel } from 'client/app/shared/components/confirm-dialog/confirm-dialog.component';
import { DbInspectionService } from 'client/app/core/services/db-inspection.service';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  delivery: DeliveryConfig;
  inspectorInfo: InspectorInfo;
  itemDeliveryConfigForm: FormGroup;
  itemInspectorInfoForm: FormGroup;
  loading = false;

  constructor(private _ngZone: NgZone,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private formBuiler: FormBuilder,
    private configurationService: ConfigurationService,
    private dbInpsectionService: DbInspectionService,
    private userNotificationService: UserNotificationService) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.configurationService.getDelivery()
      .pipe(
        map((read) => {
          this.delivery = read;
          this.createDeliveryConfigForm(this.delivery);
          return this.delivery ;
        }),
        catchError(err => {
          console.error(err);// first time is not error (delivery does not exists)
          this.delivery = CreateDeliveryConfig();
          this.createDeliveryConfigForm(this.delivery);
          return of(this.delivery);
        }),
        mergeMap(x => this.configurationService.getInspectorInfo()),
        map((read) => {
          this.inspectorInfo = read;
          this.createInspectorInfoForm(this.inspectorInfo);
          return this.delivery ;
        }),
        catchError(err => {
          console.error(err);// first time is not error (delivery does not exists)
          this.inspectorInfo = CreateInspectorInfo();
          this.createInspectorInfoForm(this.inspectorInfo);
          return of(this.delivery);
        }),
        first(),
      )
      .subscribe({
        next: (x) => {
          console.log('Initial configuration => Success');
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.userNotificationService.notifyError('MESSAGE.CONFIG.LOAD_FAILED');
          this.loading = false;
        }
       });
  }

  createInspectorInfoForm(inspectorInfo: InspectorInfo) {
    this.itemInspectorInfoForm = this.formBuiler.group({
      _id: [inspectorInfo._id],
      _rev: [inspectorInfo._rev],
      companyName: [inspectorInfo.companyName],
      companyAddress: [inspectorInfo.companyAddress],
      inspectorSign: [inspectorInfo.inspectorSign],
    });
  }

  createDeliveryConfigForm(delivery: DeliveryConfig) {
    this.itemDeliveryConfigForm = this.formBuiler.group({
      _id: [delivery._id],
      _rev: [delivery._rev],
      emailServerSecretCode: [delivery.emailServerSecretCode],
      emailServerUrl: [delivery.emailServerUrl],
      fromUser: [delivery.fromUser],
      deliveryEmails: this.formBuiler.array(delivery.deliveryEmails.map(
        x => //new FormGroup({
          [x]
        //})
      ))
    });
  }

  getDeliveryConfigFromFormGroup(): DeliveryConfig {
    return this.itemDeliveryConfigForm.getRawValue() as DeliveryConfig;
  }

  getInspectorInfoFromFormGroup(): InspectorInfo {
    return this.itemInspectorInfoForm.getRawValue() as InspectorInfo;
  }

  saveInspectorInfo() {
    const inspectorInfo = this.getInspectorInfoFromFormGroup();
    this.configurationService.updateInspectorInfo(inspectorInfo)
      .pipe(
        first()
      )
      .subscribe({
        next: (x) => this.userNotificationService.notifyInfo('MESSAGE.SAVE.SUCCESSED'),
        error: (err) => {
          console.error(err);
          this.userNotificationService.notifyError('MESSAGE.SAVE.FAILED');
        }
      });
  }

  saveDelivery() {
    const deliveryToSave = this.getDeliveryConfigFromFormGroup();
    this.configurationService.updateDelivery(deliveryToSave)
      .pipe(
        first()
      )
      .subscribe({
        next: (x) => this.userNotificationService.notifyInfo('MESSAGE.SAVE.SUCCESSED'),
        error: (err) => {
          console.error(err);
          this.userNotificationService.notifyError('MESSAGE.SAVE.FAILED');
        }
      });
  }

  download(content, fileName, contentType) {
    const a = document.createElement('a');
    const file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  }

  saveConfig() {
    this.configurationService.getConfig()
    .pipe(
      first(),
      tap(x => {
        this.download(JSON.stringify(x), 'miu_config.json', 'text/plain');
      })
    )
    .subscribe({
      next: (x) => this.userNotificationService.notifyInfo('MESSAGE.SAVE.SUCCESSED'),
      error: (err) => {
        console.error(err);
        this.userNotificationService.notifyError('MESSAGE.SAVE.FAILED');
      }
    });
  }

  loadConfig = (event) => {
      if (event.target.files && event.target.files.length > 0) {
        const file: File = event.target.files[0];
        const myReader: FileReader = new FileReader();
        myReader.onloadend = (e) => {
            const config = JSON.parse(myReader.result as string) as Configuration;
            if (config) {
              this.configurationService.setConfig(config)
              .pipe(map(x => {
                window.location.reload();
              }))
              .subscribe({
                next: (x) => console.log(x),
                error: (err) => {
                  console.error(err);
                  this.userNotificationService.notifyError('MESSAGE.CONFIG.SET_CONFIG_FAILED');
                }
              });
            } else {
              console.error('Config - No parse correctly.');
              this.userNotificationService.notifyError('MESSAGE.CONFIG.FILE_STRUCT_FAILED');
            }
        };

        myReader.readAsText(file);
      }
  };

  //EMAILS
  separatorKeysCodes = [ENTER, COMMA];
  removable = true;

  get formEmails() {
    return this.itemDeliveryConfigForm.get('deliveryEmails') as FormArray;
  }

  addEmail(event): void {
    //console.log(event.value)
    if (event.value) {
      if (this.validateEmail(event.value.trim())) {
        this.formEmails
          .push(new FormControl(event.value.trim()));
        if (event.input) {
          event.input.value = '';
        }
      } else {
        //this.item.emails.push({ value: event.value });
        //this.rulesForm.controls['emails'].setErrors({'incorrectEmail': true});
        console.error('wrong email...');
        this.userNotificationService.notifyError('MESSAGE.VALIDATION.EMAIL_FORMAT_FAILED');
      }
    }
  }

  removeEmail(data: any): void {
    //console.log('Removing ' + data)
    const inx = this.formEmails.value.indexOf(data);
    if (inx >= 0) {
      this.formEmails.removeAt(inx);
    }
  }

  showDbSize() {

    const sizeofAllStorage = () => {  // provide the size in bytes of the data currently stored
      let size = 0;
      for (let i=0; i<=localStorage.length-1; i++)
      {
      const key = localStorage.key(i);
      size += lengthInUtf8Bytes(localStorage.getItem(key));
      }
      return size;
    };

    const lengthInUtf8Bytes= (str) => {
      // Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
      const m = encodeURIComponent(str).match(/%[89ABab]/g);
      return str.length + (m ? m.length : 0);
    };

    this.dbInpsectionService.getDbSize().subscribe({
      next: (x) => {
        //todo:
        // const dialogData = new ConfirmDialogModel(this.translateService.instant('MESSAGE.CONFIG.GET_DBSIZE.UPDATE_CHECKLIST_QUESTION_TITLE'), x);

        // const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        //   maxWidth: '600px',
        //   data: dialogData
        // });
      },
      error: (err) => {
        console.error(err);
        this.userNotificationService.notifyError('CONFIG.GENERAL.DB.GET_DBSIZE_FAILED');
      }
    });
  }

  compactDb() {
    this.dbInpsectionService.compactDb().subscribe({
      next: (x) => {
        this.userNotificationService.notify('CONFIG.GENERAL.DB.COMPACT_DB_SUCCESS');
      },
      error: (err) => {
        console.error(err);
        this.userNotificationService.notifyError('CONFIG.GENERAL.DB.COMPACT_DB_FAILED');
      }
    });
  }

  private validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
}
