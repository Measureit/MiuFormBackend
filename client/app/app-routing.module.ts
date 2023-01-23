import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { PrivacyComponent } from './privacy/privacy.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'reports',
    pathMatch: 'full',
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'privacy',
    //pathMatch: 'full',
    component: PrivacyComponent,
  },
  {
    path: 'configuration',
    loadChildren: () =>
      import('./modules/configuration/configuration.module').then(
        (m) => m.ConfigurationModule
      ),
  },
  {
    path: 'reports',
    loadChildren: () =>
      import('./modules/reports/reports.module').then(
        (m) => m.ReportsModule
      ),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
