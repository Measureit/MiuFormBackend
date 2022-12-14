import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { first, mergeMap, tap } from 'rxjs';
import { EditorActions } from 'client/app/core/enums';
import { CreateFactoryInfoConfig, FactoryInfoConfig } from 'client/app/core/models';
import { ConfigurationService, ConsoleLoggerService, Logger } from 'client/app/core/services';
import { FactoryEditorComponent, FactoryEditorData } from './editor/editor.component';
import { UserNotificationService } from 'client/app/core/services/user-notification.service';

@Component({
  selector: 'app-factories',
  templateUrl: './factories.component.html',
  styleUrls: ['./factories.component.scss']
})
export class FactoriesComponent implements OnInit {

  loadFactoryWithNoActive: boolean = false;
  items: FactoryInfoConfig[] = [];
  
  constructor(
    private logger: Logger,
    private configurationService: ConfigurationService,
    private userNotificationService: UserNotificationService,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.reloadFactories();  
  }

  reloadFactories() {
    this.configurationService.getFactories(true)
      .pipe(
        tap(x => this.items = x),
        first(),
      )
      .subscribe({
        error: (err) =>{
          console.error(err);
          this.userNotificationService.notifyError('MESSAGE.LOAD.FAILED');
        } 
      });
  }

  loadFactoryWithNoActiveChange(checked: boolean) {
    this.loadFactoryWithNoActive = checked;
  }

  displayEditor(item: FactoryInfoConfig, action: EditorActions) {
    return this.dialog.open(FactoryEditorComponent, {
      width: '90%',
      data: { 
        item: item,
        action: action
      } as FactoryEditorData,
    })
    .afterClosed()
    .pipe(
      first(), 
      tap(res => this.logger.debug(`The dialog was closed with result ${res}, action ${action}`)),
      tap(res => {
        if (res === true) {
          this.reloadFactories();  
        }
      })
    );
  }

  addItem() {
    this.displayEditor(CreateFactoryInfoConfig(), EditorActions.Create)
      .subscribe({
        next: (val) => {},
        error: (err) => {}
      });
  }

  updateItem(id: string) {
    const item = this.configurationService.getFactory(id).
      pipe(
        first(),
        mergeMap(item => this.displayEditor(item, EditorActions.Update))
      )
      .subscribe({
        next: (val) => {},
        error: (err) => {}
      });    
  }

  deleteItem(event, id: string) {
    event.stopPropagation();
    console.log('delete factory');
    const item = this.configurationService.getFactory(id).
      pipe(
        first(),
        mergeMap(item => this.displayEditor(item, EditorActions.Delete))
      )
      .subscribe({
        next: (val) => {},
        error: (err) => {}
      });    
  }
}
