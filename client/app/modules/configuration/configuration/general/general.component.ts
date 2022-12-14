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
  loading: boolean = false;

  constructor(private _ngZone: NgZone,
    private formBuiler: FormBuilder,
    private configurationService: ConfigurationService,
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
       })
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
    let inspectorInfo = this.getInspectorInfoFromFormGroup();
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
    let deliveryToSave = this.getDeliveryConfigFromFormGroup();
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
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
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
        var file: File = event.target.files[0];
        var myReader: FileReader = new FileReader();
        myReader.onloadend = (e) => {
            var config = JSON.parse(myReader.result as string) as Configuration;
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
              })
            } else {
              console.error('Config - No parse correctly.');
              this.userNotificationService.notifyError('MESSAGE.CONFIG.FILE_STRUCT_FAILED');
            } 
        }

        myReader.readAsText(file); 
      }
  }

  //EMAILS
  public separatorKeysCodes = [ENTER, COMMA];
  removable = true;

  get formEmails() {
    return this.itemDeliveryConfigForm.get("deliveryEmails") as FormArray;
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
    let inx = this.formEmails.value.indexOf(data);
    if (inx >= 0) {
      this.formEmails.removeAt(inx);
    }
  }
  private validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }
}
