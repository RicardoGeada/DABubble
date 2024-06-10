import { Component, ViewChild, ElementRef, Renderer2, inject, viewChild } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LoginPageComponent } from '../login-page.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Firestore, onSnapshot, doc } from '@angular/fire/firestore';
import { UserService } from '../../firebase.service/user.service';
import { User } from '../../models/user';
import { UserAuthService } from '../../firebase.service/user.auth.service';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [LoginComponent, RouterModule, LoginPageComponent, CommonModule, FormsModule, MatCheckboxModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})

export class SignInComponent {
  checkbox = { checked: false };
  checked = false;
  disabled = false;
  hoverState = false;
  firestore: Firestore = inject(Firestore);
  user = new User();
  emailExists: boolean = false;
  iconName = '/assets/img/person_filled.png';
  iconMail = '/assets/img/mail.png';
  passwordError = false;


  constructor(
    private router: Router, private userService: UserService, private userAuth: UserAuthService) {
  }


  ngonInit() {
    this.userService.getUsers();
    if (window.innerWidth < 630) {
      this.checkbox.checked = true;
    }
  }


  goToLogin() {
    this.router.navigate(['/login-page/login']);
  }


  checkEmail() {
    const userExists = this.userService.allUsers.some(user => user.email === this.user.email);
    if (userExists) {
      this.emailExists = true;
    }
    this.emailExists = false;
    return userExists;
  }


  async goToAvatar() {
    if (this.checkEmail()) { return; }
    if (!this.validatePassword(this.user.password)) { return; }
    await this.userAuth.registerUser(this.user.email, this.user.password).then(async () => {
      await this.userService.addUser(this.user);
      await this.userAuth.saveUser(this.user.name)
    }).then(() => {
      this.router.navigate(['/login-page/avatar'], { state: { user: this.user } });
    });
  }


  checkWindowWidth() {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        return true;
      }
    }
    return false;
  }


  validatePassword(password: string): boolean {
    // Mindestens 6 Zeichen, mindestens eine Großbuchstabe, eine Kleinbuchstabe, eine Zahl und ein Sonderzeichen
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(password)) {
      this.passwordError = true;
      return false;
    }
    this.passwordError = false;
    return true;
  }


  changeIconName(focus: boolean) {
    this.iconName = focus ? '/assets/img/person_filled_b.png' : '/assets/img/person_filled.png';
  }


  changeIconMail(focus: boolean) {
      this.iconMail = focus ? '/assets/img/mail_b.png' : '/assets/img/mail.png';
  }
}