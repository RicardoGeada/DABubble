import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user.interface';
import { Channel } from '../../interfaces/channel.interface';
import { Message } from '../../interfaces/message.interface';
import { OpenProfileDirective } from '../../shared/directives/open-profile.directive';
import { Router, RouterModule } from '@angular/router';
import { ThreadService } from '../../services/thread.service';
import { UtilityService } from '../../services/utility.service';
import { UserService } from '../../firebase.service/user.service';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, OpenProfileDirective, RouterModule],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',
})
export class SearchResultsComponent {
  @Input() searchControl!: FormControl;
  @Input() filteredUsers: User[] = [];
  @Input() filteredChannels: Channel[] = []; 
  @Input() filteredMessages: Message[] = []; 
  @Input() userService!: UserService; 


  constructor(
    public router: Router,
    public threadService: ThreadService,
    public utilityService: UtilityService,
  ) { }


  getUserDisplayName(userId: string): string {
    if (!this.userService) {
      return 'User Name';
    }
    const user = this.userService.getUser(userId);
    return user ? user.name : 'User Name';
  }


  shouldShowSearchResults(): boolean {
    return this.searchControl.value.trim().length > 0 &&
      (this.filteredUsers.length > 0 || this.filteredChannels.length > 0 || this.filteredMessages.length > 0);
  }


  displayChannelTime(): string {
    return this.utilityService.getChannelCreationTime();
  }
  

  closeThread() {
    this.userService.saveLastThread(this.userService.currentUser.id, '');
    this.threadService.closeThread();
  }
}
