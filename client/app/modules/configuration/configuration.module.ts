import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationComponent } from './configuration/configuration.component';
import { ConfigurationRoutingModule } from './configuration-routing.module';
import { FactoriesComponent } from './configuration/factories/factories.component';
import { ChecklistComponent } from './configuration/checklist/checklist.component';
import { GeneralComponent } from './configuration/general/general.component';
import { SharedModule } from 'client/app/shared/shared.module';
import { FactoryEditorComponent } from './configuration/factories/editor/editor.component';
import { ChecklistItemEditorComponent } from './configuration/checklist/editor/editor.component';


@NgModule({
  declarations: [
    ConfigurationComponent,
    FactoriesComponent,
    ChecklistComponent,
    GeneralComponent,
    FactoryEditorComponent,
    ChecklistItemEditorComponent
  ],
  imports: [
    CommonModule,
    ConfigurationRoutingModule,
    SharedModule
  ]
})
export class ConfigurationModule { }
