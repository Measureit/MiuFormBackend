import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { SidenavService } from './core/services';
import { onMainContentChange } from './shared/animations/animations';
import { OperationMessageComponent } from './shared/components/operation-message/operation-message.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [onMainContentChange],
})
export class AppComponent implements OnInit {
  public onSideNavChange = true;
  configSuccess: MatSnackBarConfig = {
    duration: 2000,
    horizontalPosition: 'right',
    verticalPosition: 'bottom',
  };

  ngOnInit() {
    
  }

  constructor(
    private snackBar: MatSnackBar,
    private sidenavService: SidenavService,
    translate: TranslateService) {

      translate.addLangs(['pl', 'en', 'de']);
      translate.setDefaultLang('en');
  
      if(localStorage.getItem('language')){
        translate.setDefaultLang(localStorage.getItem('language') || 'en');
        translate.use(localStorage.getItem('language') || 'en');
      } else {
        const browserLang = translate.getBrowserLang() || 'en';
        const langFromBrowser = browserLang.match(/pl|en|de/) ? browserLang : 'en';
        translate.use(langFromBrowser);
        localStorage.setItem("language",langFromBrowser);
      }
    

    this.sidenavService.sideNavState$.subscribe((res) => {
      this.onSideNavChange = res;
    });
  }
}
