import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { UserAuthService } from '../../../firebase.service/user.auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../firebase.service/user.service';
import { OpenProfileDirective } from '../../../shared/directives/open-profile.directive';
import { ChannelService } from '../../../firebase.service/channel.service';

@Component({
  selector: 'app-log-out-dialog',
  standalone: true,
  imports: [CommonModule, OpenProfileDirective],
  templateUrl: './log-out-dialog.component.html',
  styleUrl: './log-out-dialog.component.scss',
})
export class LogOutDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<LogOutDialogComponent>,
    private userAuth: UserAuthService,
    private router: Router,
    public userService: UserService,
    public channelService : ChannelService,
  ) {}


  openCurrentUser(): void {
    this.dialogRef.close();
  }


  isMobile() {
    return window.innerWidth <= 768;
  } 


  logOut(): void {
    this.userAuth.logout().then(async() => {
      this.dialogRef.close();
      localStorage.removeItem('currentUser');
      await this.userService.updateOnlineStatus(this.userService.currentUser.id, false);
      window.location.href = '/login-page';
    });
  }
}
