import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ProfileService } from '../../services/profile.service';
import { DialogEditProfileComponent } from '../../shared/dialog-edit-profile/dialog-edit-profile.component';
import { CustomDialogService } from '../../services/custom-dialog.service';
import { UserService } from '../../firebase.service/user.service';
import { User } from '../../interfaces/user.interface';
import { ChannelFirebaseService } from '../../firebase.service/channelFirebase.service';
import { Channel } from '../../interfaces/channel.interface';
import { ChannelTypeEnum } from '../../shared/enums/channel-type.enum';
import { Router } from '@angular/router';
import { ThreadService } from '../../services/thread.service';

@Component({
  selector: 'app-dialog-show-profile',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './dialog-show-profile.component.html',
  styleUrl: './dialog-show-profile.component.scss',
})
export class DialogShowProfileComponent implements OnInit {
  user: User | null = null;
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
    public dialogRef: MatDialogRef<DialogShowProfileComponent>,
    private profileService: ProfileService,
    private customDialogService: CustomDialogService,
    public userService: UserService,
    public channelService: ChannelFirebaseService,
    private router : Router,
    public threadService : ThreadService,
  ) {}


  ngOnInit(): void {
    const userId = this.profileService.getViewingUserId();
    if (userId) {
      this.user = this.userService.getUser(userId);
    }
  }


  isOwnProfile(): boolean {
    return this.profileService.getOwnProfileStatus();
  }


  editCurrentUser(button: HTMLElement): void {
    const component = DialogEditProfileComponent;
    let userHeadButton = document.getElementById('userHead');
    if(userHeadButton) {this.customDialogService.openDialogAbsolute({button : userHeadButton, component, 
        position : 'right', mobilePosition: 'mid', maxWidth: '500px'});}
    else {this.customDialogService.openDialog(component)};
    this.dialogRef.close();
  }


  async openDirectChannel(user_id: string): Promise<void> {
    let channel_id = this.channelService.getDirectChannelId(this.userService.currentUser.id, user_id);
    if (channel_id != '') {
      this.router.navigateByUrl('/main-page/' + channel_id);
    } else {
      channel_id = await this.createNewDirectChannel(user_id);
      this.router.navigateByUrl('/main-page/' + channel_id);
    }
    this.closeThread();
    this.dialogRef.close();
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
