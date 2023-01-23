import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SidenavService } from '../core/services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  siteLocale = 'en';
  constructor(
    private router: Router,
    private sidenavService: SidenavService,
    public translate: TranslateService
  ) {}

  ngOnInit() {
    this.siteLocale = window.location.pathname.split('/')[1];
  }

  onSinenavToggle() {
    this.sidenavService.sideNavState$.next(
      !this.sidenavService.sideNavState$.value
    );
  }



  setLang(lang: string)
  {
    localStorage.setItem('language',lang);
    this.translate.use(lang);
  }
}
