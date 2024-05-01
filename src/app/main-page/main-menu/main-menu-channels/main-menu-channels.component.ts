import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { DynamicContentComponent } from '../../../shared/dynamic-content/dynamic-content.component';
import { AddChannelCardComponent } from './add-channel-card/add-channel-card.component';
import { CustomDialogService } from '../../../services/custom-dialog.service';
import { ChannelService } from '../../../services/channel.service';
import { ChannelFirebaseService } from '../../../firebase.service/channelFirebase.service';
import { ChannelTypeEnum } from '../../../shared/enums/channel-type.enum';
import { Observable } from 'rxjs';
import { Channel } from '../../../interfaces/channel.interface';
import { UserAuthService } from '../../../firebase.service/user.auth.service';
import { UserService } from '../../../firebase.service/user.service';

@Component({
  selector: 'app-main-menu-channels',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatExpansionModule,
    DynamicContentComponent,
  ],
  templateUrl: './main-menu-channels.component.html',
  styleUrl: './main-menu-channels.component.scss',
})
export class MainMenuChannelsComponent implements OnInit {
  isExpanded = true;


  constructor(private customDialogService: CustomDialogService, public channelService : ChannelFirebaseService,  private authService: UserAuthService,
    private userService: UserService
  ) {
    
  }

  ngOnInit(): void {
    this.loadChannelsForCurrentUser();
    console.log(this.channelService.channels)
  }

  loadChannelsForCurrentUser() {
    const userId = this.userService.currentUser.id;  // Ruft die aktuelle Benutzer-ID ab
    console.log(userId);
    if (userId) {
      this.channelService.getChannelsForCurrentUser(userId);
    } else {
      console.error('Keine Benutzer-ID verfügbar');
    }
  }
  

  toggleExpansion() {
    this.isExpanded = !this.isExpanded;
  }

  openAddChannelDialog() {
    const component = AddChannelCardComponent;
    this.customDialogService.openDialog(component);
  }
}
