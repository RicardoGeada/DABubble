import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { LoginPageComponent } from './login-page/login-page.component';
import { EmailSnackbarComponent } from './popups/email-snackbar/email-snackbar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserAuthService } from './firebase.service/user.auth.service';
import { UserService } from './firebase.service/user.service';
import { ChannelService } from './firebase.service/channel.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoginPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'DABubble';
  timeoutId: any;
  userId: any;

  loggedIn : boolean = false;

  private queryParamsSubscription!: Subscription;

  constructor(private router: Router, 
    private _snackBar: MatSnackBar, 
    public userAuth: UserAuthService,
    public userService: UserService, 
    public channelService: ChannelService,
    private route: ActivatedRoute) {
    if (userService.currentUser) {
      this.userId = userService.currentUser.id;
    }
  }


  @HostListener('window:unload', ['$event'])
  unloadHandler(event: Event) {
    this.userAuth.logout();
    if (this.userId) {
    this.userService.updateOnlineStatus(this.userId, false);
    }
  }


  async ngOnInit() {
    // check if user is logged in
    await this.userAuth.checkAuth().then( isLoggedIn => this.loggedIn = isLoggedIn )
    this.checkQueryParams();
  }

  checkQueryParams() {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const mode = params['mode'];
      const oobCode = params['oobCode'];

      if (mode === 'resetPassword' && oobCode) {
        this.router.navigate(['/reset-password'], { queryParams: { mode, oobCode } });
      } 
      else if ((mode === 'verifyAndChangeEmail' || mode === 'recoverEmail' || mode === 'verifyEmail') && oobCode) {
        if(!this.loggedIn && mode === 'verifyAndChangeEmail') this.router.navigate(['/login-page/login'], { queryParams: { mode, oobCode } });
        else { this.router.navigate(['/auth-email'], { queryParams: { mode, oobCode } }); };
      } 
      else {
        if (this.loggedIn) {
          this.getUserData();
          this.setUserChannel();
        } else {
          this.userAuth.logout();
          this.router.navigate(['/login-page/login']);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }

  setUserChannel() {
    if (this.userService.currentUser) {
      if (this.channelService.currentChannel.active_members.includes(this.userService.currentUser.id)) {
        this.router.navigate(['/main-page/' + this.userService.currentUser.last_channel]);
      } else { 
        this.router.navigate(['/main-page']);
      }
    }
  }


  getUserData(){
    this.userService.getUsers();
    this.userService.getCurrentUser();
    setTimeout(() => {
      localStorage.setItem('currentUser', JSON.stringify(this.userService.currentUser));
    }, 500);
  }


  confirmPopup() {
    this._snackBar.openFromComponent(EmailSnackbarComponent, {
      duration: 2000,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      direction: 'rtl'
    });
  }
}
