import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
//import { MediaChange, MediaObserver } from '@angular/flex-layout';

@Injectable()
export class SidenavService {
  public sideNavState$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2){
    this.renderer = rendererFactory.createRenderer('', null);
    this.checkWindowWidth();
    this.renderer.listen(window, 'resize', (event) => {
      this.checkWindowWidth();
    });
  }

  private checkWindowWidth(): void {
    if(window.innerWidth > 768){
      this.sideNavState$.next(true);
    }else{
      this.sideNavState$.next(false);
    }
  }
}
