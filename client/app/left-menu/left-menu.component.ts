import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { SidenavService } from '../core/services';
import { animateText, onSideNavChange } from '../shared/animations/animations';

@Component({
  selector: 'app-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.scss'],
  animations: [onSideNavChange, animateText],
})
export class LeftMenuComponent {
  public sideNavState = true;
  public linkText = true;
  constructor(
    private sidenavService: SidenavService
  ) {
    this.sidenavService.sideNavState$.subscribe((res) => {
      this.sideNavState = res;
      setTimeout(() => {
        this.linkText = res;
      }, 200);
    });
  }
}
