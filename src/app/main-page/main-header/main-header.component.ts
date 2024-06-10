import { Component, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { LogOutDialogComponent } from './log-out-dialog/log-out-dialog.component';
import { CustomDialogService } from '../../services/custom-dialog.service';
import { UserService } from '../../firebase.service/user.service';
import { MainMenuComponent } from '../main-menu/main-menu.component';
import { ChannelFirebaseService } from '../../firebase.service/channelFirebase.service';
import { SharedService } from '../../services/shared.service';
import { MainPageComponent } from '../main-page.component';
import { ThreadService } from '../../services/thread.service';
@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, MatCardModule, MainMenuComponent],
  templateUrl: './main-header.component.html',
  styleUrl: './main-header.component.scss',
})
export class MainHeaderComponent {
  anonymImg = 'assets/img/person.png';
  serverName: any = 'Dabbuble';
  isMenuOpen: boolean = true;

  constructor(
    private customDialogService: CustomDialogService,
    public userService: UserService,
    public channelService: ChannelFirebaseService,
    private renderer: Renderer2, 
    private el: ElementRef,
    public sharedService: SharedService,
    public mainPage: MainPageComponent,
    public threadService: ThreadService) {
  }


  ngAfterViewInit() {
    this.showMobileWorkspace();
    this.hideMobileWorkspace();
  }


  showMobileWorkspace(){
    this.sharedService.showMobileDiv$.subscribe(() => {
      const mobileDiv = this.el.nativeElement.querySelector('.mobileDiv');
      this.renderer.addClass(mobileDiv, 'show');
    });
  }


  hideMobileWorkspace(){
    this.sharedService.backToChannels$.subscribe(() => {
      const mobileDiv = this.el.nativeElement.querySelector('.mobileDiv');
      this.renderer.removeClass(mobileDiv, 'show');
    });
  }


  backToChannels() {
    this.sharedService.backToChannels();
    this.threadService.closeThread();
  }


  openLogOutDialog(button: HTMLElement) {
    const component = LogOutDialogComponent;
    this.customDialogService.openDialogAbsolute({button, component, position : 'right', mobilePosition : 'bottom', maxWidth : '282px'});
  }
}
