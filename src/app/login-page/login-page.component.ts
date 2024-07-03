import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AvatarComponent } from './avatar/avatar.component';
import { CommonModule } from '@angular/common';
import { UserAuthService } from '../firebase.service/user.auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterModule, LoginComponent, SignInComponent, ResetPasswordComponent,
    AvatarComponent, CommonModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent {
  hideElement = false;
  hideExtras = false;
  oobCode: string = '';

  constructor(private router: Router, private userAuth: UserAuthService, public route: ActivatedRoute) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.hideElement = this.router.url !== '/login-page/login';
      }
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.hideExtras = this.router.url == '/login-page/imprint' || this.router.url == '/login-page/privacy-policy';
      }
    });
    this.resetUser();
  }


  goToSignin() {
    this.router.navigate(['/login-page/signin']);
  }


  resetUser(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('currentUser');
    }
  }
}
