import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogContent,
  MatDialogActions,
  MatDialogRef,
  MatDialogModule,
  MatDialog,
} from '@angular/material/dialog';
import { ChannelService } from '../../../../services/channel.service';
import { ChannelFirebaseService } from '../../../../firebase.service/channelFirebase.service';
import { Channel } from '../../../../interfaces/channel.interface';
import { ChannelTypeEnum } from '../../../../shared/enums/channel-type.enum';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UserService } from '../../../../firebase.service/user.service';

@Component({
  selector: 'app-add-channel-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogModule,
    FormsModule,
  ],
  templateUrl: './add-channel-card.component.html',
  styleUrl: './add-channel-card.component.scss',
})
export class AddChannelCardComponent implements OnInit, OnDestroy {

  channel: Channel = {
    name: '',
    description: '',
    created_at: Date.now(),
    creator: this.userService.currentUser.id,
    members: [this.userService.currentUser.id],
    active_members: [],
    channel_type: ChannelTypeEnum.main,
  };

  constructor(
    public dialogRef: MatDialogRef<AddChannelCardComponent>,
    public dialog: MatDialog,
    public channelService : ChannelFirebaseService,
    public userService : UserService,
  ) {
    console.log(this.channelService.channels)
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  createChannel(): void {
    this.channelService.addChannel(this.channel);
    this.dialogRef.close();
  }
}
