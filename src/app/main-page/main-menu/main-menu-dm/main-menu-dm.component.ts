import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../firebase.service/user.service';
import { User } from '../../../interfaces/user.interface';
import { ChannelFirebaseService } from '../../../firebase.service/channelFirebase.service';
import { Router } from '@angular/router';
import { Channel } from '../../../interfaces/channel.interface';
import { ChannelTypeEnum } from '../../../shared/enums/channel-type.enum';
import { ThreadService } from '../../../services/thread.service';
import { StateManagementService } from '../../../services/state-management.service';
import { MainPageComponent } from '../../main-page.component';
import { SharedService } from '../../../services/shared.service';


@Component({
  selector: 'app-main-menu-dm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-menu-dm.component.html',
  styleUrl: './main-menu-dm.component.scss',
})
export class MainMenuDmComponent implements OnInit {
  isExpanded: boolean = true;
  users: User[] = [];
  selectedUserId: string = '';
  profileImg = this.userService.currentUser?.profile_img;
  newDirectChannel : Channel = {
    id: '',
    name: 'Direct Channel',
    description: '',
    created_at: new Date().getTime(),
    creator: '',
    members: [],
    active_members: [],
    channel_type: ChannelTypeEnum.direct,
  }

  constructor(
    public userService: UserService,
    public channelService: ChannelFirebaseService,
    private router : Router,
    public threadService : ThreadService,
    private stateService: StateManagementService,
    public mainpage: MainPageComponent,
    public sharedService: SharedService
  ) {}


  ngOnInit(): void {
    this.users = this.userService.allUsers;
    this.stateService.getSelectedUserId().subscribe(id => {
      this.selectedUserId = id ? id : '';
    });
  }


  toggleExpansion(): void {
    this.isExpanded = !this.isExpanded;
  }


  async openDirectChannel(user_id: string): Promise<void> {
    this.openChannel(user_id);
    this.closeThread();
    this.stateService.setSelectedUserId(user_id);
  }


  async openDirectChannelMobile(user_id: string): Promise<void> {
    this.mainpage.toggleMenu();
    this.sharedService.showMobileDiv();
    this.openChannel(user_id);
    this.closeThread();
    this.stateService.setSelectedUserId(user_id);
  }


  async openChannel(user_id: string): Promise<void> {
    let channel_id = this.channelService.getDirectChannelId(this.userService.currentUser.id, user_id);
    if (channel_id != '') {
      this.router.navigateByUrl('/main-page/' + channel_id);
    } else {
      channel_id = await this.createNewDirectChannel(user_id);
      this.router.navigateByUrl('/main-page/' + channel_id);
    }
  }


  async createNewDirectChannel(user_id : string) {
    this.newDirectChannel.creator = this.userService.currentUser.id;
    this.newDirectChannel.created_at = new Date().getTime();
    this.newDirectChannel.members = [this.userService.currentUser.id, user_id];
    return await this.channelService.addChannel(this.newDirectChannel);
  }


  closeThread() {
    this.userService.saveLastThread(this.userService.currentUser.id, '');
    this.threadService.closeThread();
  }
}
