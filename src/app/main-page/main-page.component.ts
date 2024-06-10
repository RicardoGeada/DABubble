import { Component, HostListener } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ChannelComponent } from './channel/channel.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { MainHeaderComponent } from './main-header/main-header.component';
import { ChannelFirebaseService } from '../firebase.service/channelFirebase.service';
import { UserService } from '../firebase.service/user.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThreadComponent } from './thread/thread.component';
import { ThreadService } from '../services/thread.service';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [MatCardModule, ChannelComponent, MainMenuComponent, MainHeaderComponent, RouterModule, CommonModule, ThreadComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})

export class MainPageComponent {

  constructor(public userService: UserService,
    public channelService: ChannelFirebaseService,
    public threadService: ThreadService,
    public sharedService: SharedService) {
    if (this.userService.currentUser) this.channelService.getChannelsForCurrentUser();
  }


  ngOnInit(): void {
    this.sharedService.backToChannels$.subscribe(() => {
      this.toggleMenu();
    });
    if (typeof window !== 'undefined' && window.innerWidth > 768 && window.innerWidth < 1500 && this.threadService.threadOpen) {
      this.sharedService.isMenuOpen = false;
    }
  }


  toggleMenu(): void {
    this.sharedService.isMenuOpen = !this.sharedService.isMenuOpen;
    if (this.threadService.threadOpen && window.innerWidth > 768 && window.innerWidth < 1500) {
      this.threadService.closeThread();
    }
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: { target: { innerWidth: number; }; }) {
    if (typeof window !== 'undefined') {
      if (event.target.innerWidth < 1200 && event.target.innerWidth > 768 && this.sharedService.isMenuOpen) {
        this.sharedService.isMenuOpen = false;
        this.sharedService.showMobileDiv();
      } if (event.target.innerWidth > 1200 && event.target.innerWidth < 1500 && this.threadService.threadOpen) {
        this.sharedService.isMenuOpen = false;
      } else {
        if (event.target.innerWidth > 1200 && !this.sharedService.isMenuOpen) {
          this.sharedService.isMenuOpen = true;
          this.sharedService.showMobileDiv();
        }
      }
    }
  }
}