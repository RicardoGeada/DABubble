import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { UserAuthService } from '../../firebase.service/user.auth.service';
import { Firestore } from '@angular/fire/firestore';
import { UserService } from '../../firebase.service/user.service';
import { ChannelService } from '../../firebase.service/channel.service';
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
  iconSrc = 'assets/img/mail.png';
  passwSrc = 'assets/img/lock.png';
  oobCode: string = '';
  infoText: string = 'Wir empfehlen dir, die E-Mail-Adresse zu nutzen, die du bei der Arbeit verwendest.';

  constructor(private userAuth: UserAuthService, 
    private userService: UserService,
    private router: Router, 
    private channelService: ChannelService,
    public route: ActivatedRoute
  ) { }


  ngOnInit() {
    this.error = false;
    this.route.queryParams.subscribe((params) => {
      const mode = params['mode'];
      if (mode === 'verifyAndChangeEmail') this.infoText = 'Bitte logge dich mit deiner alten Email ein, um die Änderung deiner Email-Adresse zu akzeptieren.';
    })
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
    // this.navigateToMainPage();
    this.handleNavigation();
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


  handleNavigation() {
    this.route.queryParams.subscribe((params) => {
      const mode = params['mode'];
      const oobCode = params['oobCode'];
      if((mode === 'verifyAndChangeEmail' || mode === 'recoverEmail') && oobCode) this.router.navigate(['/auth-email'], { queryParams: { mode, oobCode } });
      else this.navigateToMainPage();
    })
  }

  navigateToMainPage() {
    this.router.navigate(['/main-page']);
  }


  setGoogleUser() {
    let user = this.userService.allUsers.find(user => user.email === this.userAuth.googleEmail);
    if (user) {
      return user;
    } else {
    return this.createUserObject();
    }
  }


  createUserObject() {
    return {
      name: this.userAuth.googleName,
      email: this.userAuth.googleEmail,
      profile_img: this.userAuth.googleProfileImg,
      id: '',
      last_channel: '',
      last_thread: '',
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
    this.iconSrc = focus ? 'assets/img/mail_b.png' : 'assets/img/mail.png';
  }


  changePasswIcon(focus: boolean) {
    this.passwSrc = focus ? 'assets/img/lock_b.png' : 'assets/img/lock.png';
  }
}
