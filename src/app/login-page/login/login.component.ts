import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { UserAuthService } from '../../firebase.service/user.auth.service';
import { Firestore } from '@angular/fire/firestore';
import { UserService } from '../../firebase.service/user.service';
import { ChannelFirebaseService } from '../../firebase.service/channelFirebase.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule, ResetPasswordComponent,
    MatProgressBarModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  firestore: Firestore = inject(Firestore);
  error = false;
  loginEmail: string = '';
  loginPassword: string = '';
  isLoading = false;
  iconSrc = '/assets/img/mail.png';
  oobCode: string = '';

  constructor(private userAuth: UserAuthService, 
    private userService: UserService,
    private router: Router, 
    private channelService: ChannelFirebaseService,
    public route: ActivatedRoute
  ) { }


  ngonInit() {
    this.error = false;
  }


  async login() {
    this.isLoading = true;
    this.userAuth.loginUser(this.loginEmail, this.loginPassword)
      .then(() => {
        return Promise.all([this.loadUserData(this.loginEmail)]);
      })
      .then(() => {
        this.updateLoggedInUser();
      })
      .catch((error) => {
        this.error = true;
        this.isLoading = false;
      });
  }


  updateLoggedInUser() {
    this.error = false;
    this.isLoading = false;
    this.userService.updateOnlineStatus(this.userService.currentUser.id, true);
    localStorage.setItem('currentUser', JSON.stringify(this.userService.currentUser));
    this.navigateToMainPage();
  }


  loadUserData(loginEmail: string) {
    this.error = false;
    this.userService.getUsers();
    this.userService.getCurrentUser(loginEmail);
    this.channelService.getChannelsForCurrentUser();
  }


  async loginWithGoogle() {
    await this.userAuth.loginWithGoogle();
    this.isLoading = true;
    let user = this.setGoogleUser();
    let googleUserId = this.userService.allUsers.find(user => user.email === this.userAuth.googleEmail)?.id;
    if (!googleUserId) {
      await this.userService.addUser(user);
    }
    await Promise.all([
      this.loadUserData(this.userAuth.googleEmail),
    ]).then(() => {
      this.updateLoggedInUser();
    });
  }


  navigateToMainPage() {
    this.router.navigate(['/main-page']);
  }


  setGoogleUser() {
    let user = this.userService.allUsers.find(user => user.email === this.userAuth.googleEmail);
    return this.createUserObject(user);
  }


  createUserObject(user: any) {
    return {
      name: this.userAuth.googleName,
      email: this.userAuth.googleEmail,
      profile_img: this.userAuth.googleProfileImg,
      id: user.id,
      last_channel: user.last_channel || '',
      last_thread: user.last_thread || '',
      logged_in: true,
      is_typing: false,
      password: '',
      toJSON() {
        return {
          name: this.name,
          email: this.email,
          profile_img: this.profile_img,
          id: this.id,
          last_channel: this.last_channel,
          last_thread: this.last_thread,
          logged_in: this.logged_in,
          is_typing: this.is_typing,
          password: this.password
        };
      }
    };
  }


  async loginAsGuest() {
    this.isLoading = true;
    this.error = false;
    await this.userAuth.guestLogin();
    await Promise.all([
      this.loadUserData('guest'),
    ]).then(() => {
      this.updateLoggedInUser();
    });
  }


  changeIcon(focus: boolean) {
    this.iconSrc = focus ? '/assets/img/mail_b.png' : '/assets/img/mail.png';
  }
}
