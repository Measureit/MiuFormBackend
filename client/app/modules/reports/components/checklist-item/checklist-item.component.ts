import { Component, Input, OnInit } from '@angular/core';
import { first, map, mergeMap, Observable, tap, zip } from 'rxjs';
import { FactoryInfoConfig, ImageSize, Report, ReportImageItem } from 'client/app/core/models';
import { ReportService } from 'client/app/core/services';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-checklist-item',
  templateUrl: './checklist-item.component.html',
  styleUrls: ['./checklist-item.component.scss']
})
export class ChecklistItemComponent implements OnInit {
  @Input() checklistItemFormGroup: FormGroup;
  detailsShown: boolean;

  constructor() { }


  ngOnInit(): void {
    //console.log('checklist item init');
    this.detailsShown = this.hasDetails;
  }

  //has any image or comment
  get hasDetails(): boolean {
    return this.pointImages.controls.length > 0 ||
      this.comment?.length > 0;
  }

  get pointImages(): FormArray {
    return this.checklistItemFormGroup.get('pointImages') as FormArray;
  }

  get comment(): string | undefined {
    return this.checklistItemFormGroup.get('comment').value;
  }

  get isChecked(): boolean | null {
    return this.checklistItemFormGroup.get('isChecked').value;
  }
  set isChecked(value: boolean | null)  {
    this.checklistItemFormGroup.get('isChecked').setValue(value);
  }

  onClickChecked() {
    if (this.isChecked === null) {
      this.isChecked = false;
    } else if (this.isChecked === false) {
      this.isChecked = true;
    } else if (this.isChecked === true) {
      this.isChecked = null;
    }
  }


  showDetails(event) {
    //console.log('showDetails');
    this.detailsShown = !this.detailsShown;
    event.stopPropagation();
  }
 }
