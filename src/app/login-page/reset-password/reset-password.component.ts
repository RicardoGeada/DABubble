import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginSnackbarComponent } from '../../popups/login-snackbar/login-snackbar.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserAuthService } from '../../firebase.service/user.auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  userId: string | any;
  resetPassword: string = '';
  resetPasswordAgain: string = '';
  oobCode: string = '';
  iconPassw: string = 'assets/img/lock.png';
  passwordError: boolean = false;
  constructor(private router: Router, private _snackBar: MatSnackBar,
    private userAuth: UserAuthService, private route: ActivatedRoute) { }


  goToCheckEmail() {
    this.router.navigate(['/login-page/check-email']);
  }


  returnToLogin() {
    setTimeout(() => {
      this.router.navigate(['/login-page/login']);
    }, 1000);
  }


  confirmPopup() {
    this._snackBar.openFromComponent(LoginSnackbarComponent, {
      duration: 2000,
      horizontalPosition: 'start',
      verticalPosition: 'bottom',
      direction: 'rtl',
    });
  }


  triggerAnimation() {
    const element = document.querySelector('.cdk-overlay-container');
    if (element) {
      element.classList.add('animate');

      setTimeout(() => {
        element.classList.remove('animate');
      }, 2000);
    }
  }


  updateUserPassword(newPassword: string) {
    this.oobCode = this.route.snapshot.queryParams['oobCode'];
    this.userAuth.changePassword(newPassword, this.oobCode);
  }
  

  changePassword(newPassword: string) {
    if(this.validatePassword(this.resetPassword)) {
      Promise.resolve(this.updateUserPassword(newPassword)).then(() => {
        this.confirmPopup();
        this.returnToLogin();
        this.triggerAnimation();
      }).catch((error) => {
        console.error(error);
      });
    }
  }


  changeIconPassw(focus: boolean) {
    this.iconPassw = focus ? 'assets/img/lock_b.png' : 'assets/img/lock.png';
  }

  validatePassword(password: string): boolean {
    // Mindestens 6 Zeichen, mindestens eine Großbuchstabe, eine Kleinbuchstabe, eine Zahl , ein Sonderzeichen '@$!%*?&._'
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._])[A-Za-z\d@$!%*?&._]{6,}$/;
    if (!passwordRegex.test(password)) {
      this.passwordError = true;
      setTimeout(() => this.passwordError = false, 2000);
      return false;
    }
    this.passwordError = false;
    return true;
  }
}
