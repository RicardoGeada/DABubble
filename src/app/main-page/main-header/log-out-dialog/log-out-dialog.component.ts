import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { UserAuthService } from '../../../firebase.service/user.auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../firebase.service/user.service';
import { OpenProfileDirective } from '../../../shared/directives/open-profile.directive';

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
    public userService: UserService
  ) {}


  openCurrentUser(): void {
    this.dialogRef.close();
  }


  isMobile() {
    return window.innerWidth <= 768;
  } 


  logOut(): void {
    this.userAuth.logout().then(() => {
      this.router.navigate(['/login-page']);
      localStorage.removeItem('currentUser');
      this.dialogRef.close();
      this.userService.updateOnlineStatus(this.userService.currentUser.id, false);
    });
  }
}
