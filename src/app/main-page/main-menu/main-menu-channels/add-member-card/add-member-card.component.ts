import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import {
  MatRadioModule,
  MAT_RADIO_DEFAULT_OPTIONS,
} from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../firebase.service/user.service';
import { User } from '../../../../interfaces/user.interface';
import { ChannelFirebaseService } from '../../../../firebase.service/channelFirebase.service';
import { UserManagementService } from '../../../../services/user-management.service';
import { OpenProfileDirective } from '../../../../shared/directives/open-profile.directive';
import { Router } from '@angular/router';
import { SharedService } from '../../../../services/shared.service';

@Component({
  selector: 'app-add-member-card',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatRadioModule, FormsModule, OpenProfileDirective],
  providers: [
    { provide: MAT_RADIO_DEFAULT_OPTIONS, useValue: { color: 'primary' } },
  ],
  templateUrl: './add-member-card.component.html',
  styleUrl: './add-member-card.component.scss',
})
export class AddMemberCardComponent {
  selectedOption: string = 'all';
  searchInput: string = '';
  filteredUsers: User[] = [];
  selectedUsers: User[] = [];
  showUserList: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddMemberCardComponent>,
    public userService: UserService,
    public channelService: ChannelFirebaseService,
    public userManagementService: UserManagementService,
    public router: Router,
    public sharedService: SharedService
  ) { }


  onFilterUsers(): void {
    this.filteredUsers = this.userManagementService.filterUsers(this.searchInput, this.selectedUsers);
    this.showUserList = true;
  }


  onSelectUser(user: User): void {
    this.selectedUsers = this.userManagementService.selectUser(this.selectedUsers, user);
    this.searchInput = '';
    this.onFilterUsers();
  }


  onRemoveSelectedUser(user: User): void {
    this.selectedUsers = this.userManagementService.removeSelectedUser(this.selectedUsers, user);
    this.onFilterUsers();
  }


  onUpdateMembers(): void {
    let memberIds: string[];
    if (this.selectedOption === 'all') {
      memberIds = this.userManagementService.getAllUserIds();
    } else {
      memberIds = this.userManagementService.getMemberIds(this.selectedUsers);
    }
    this.update(memberIds);
    
  }


  update(memberIds: string[]) {
    const channelId = this.userManagementService.getCurrentChannelId();
    if (channelId) {
      this.userManagementService.updateMembers(channelId, memberIds)
      this.closeMenuIfMobile();
      this.router.navigate(['/main-page/' + channelId])
        .then(() =>
          this.dialogRef.close()
        );
    }
  }


  closeMenuIfMobile() {
    if (window.innerWidth < 768) {
      this.sharedService.isMenuOpen = false;
      this.sharedService.showMobileDiv();
    }
  }
}