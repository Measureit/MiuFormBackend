import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { first, tap } from 'rxjs';
import { EditorActions } from 'client/app/core/enums';
import { ChecklistItemConfig, FactoryInfoConfig } from 'client/app/core/models';
import { ConfigurationService } from 'client/app/core/services';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormGroup, AbstractControl, Validators, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { UserNotificationService } from 'client/app/core/services/user-notification.service';

export interface ChecklistItemEditorData {
  item: ChecklistItemConfig;
  action: EditorActions;
}

@Component({
  selector: 'app-checkitem-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class ChecklistItemEditorComponent {

  item: ChecklistItemConfig;
  itemForm: FormGroup;

  public EditorActions = EditorActions; //to use in html



  constructor(
    private formBuiler: FormBuilder,
    private configurationService: ConfigurationService,
    private userNotificationService: UserNotificationService,
    public dialogRef: MatDialogRef<ChecklistItemEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ChecklistItemEditorData,
  ) {
    this.item = data.item;

    this.itemForm = this.formBuiler.group({
      _id: [this.item._id],
      _rev: [this.item._rev],
      isActive: [this.item.isActive],
      content: [this.item.content, [Validators.required, Validators.minLength(2)]],
      order: [this.item.order]
    });
    this.itemForm.markAllAsTouched();
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  getFromFormGroup(): ChecklistItemConfig {
    return this.itemForm.getRawValue() as ChecklistItemConfig;
  }

  addOrUpdateItem(item: ChecklistItemConfig): void {
    this.configurationService.addOrUpdateCheckListItem(item)
      .pipe(
        first(),
        tap(x => this.dialogRef.close(true))
      ).subscribe({
        next: (x) => this.userNotificationService.notifyInfo('MESSAGE.SAVE.SUCCESSED'),
        error: (err) => {
          console.error(err);
          this.userNotificationService.notifyError('MESSAGE.SAVE.FAILED');
        }
      });
  }

  deleteItem(item: ChecklistItemConfig): void {
    item.isActive = false;
    this.configurationService.addOrUpdateCheckListItem(item)
      .pipe(
        first(),
        tap(x => this.dialogRef.close(true))
      ).subscribe({
        next: (x) => this.userNotificationService.notifyInfo('MESSAGE.DELETE.SUCCESSED'),
        error: (err) => {
          console.error(err);
          this.userNotificationService.notifyError('MESSAGE.DELETE.FAILED');
        }
      });
  }
}
