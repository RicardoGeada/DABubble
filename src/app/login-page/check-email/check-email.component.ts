import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar,MatSnackBarModule} from '@angular/material/snack-bar';
import { EmailSnackbarComponent } from '../../popups/email-snackbar/email-snackbar.component';
import { send } from 'process';
import { UserAuthService } from '../../firebase.service/user.auth.service';
import { updateProfile } from '@angular/fire/auth';

@Component({
  selector: 'app-check-email',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './check-email.component.html',
  styleUrl: './check-email.component.scss'
})
export class CheckEmailComponent {
  resetEmail: string = '';
  error = false;

  constructor(private router: Router, private _snackBar: MatSnackBar, private userAuth: UserAuthService) { }


  goToLogin(){
    this.router.navigate(['/login-page/login']);
  }


  sendPasswordResetEmail(){
    this.userAuth.resetPassword(this.resetEmail).then(() => {
      this.confirmPopup();
      this.triggerAnimation();
      this.resetEmail = '';
      this.error = false;
    })
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


  confirmPopup(){
    this._snackBar.openFromComponent(EmailSnackbarComponent, {
      duration: 2000,
      horizontalPosition: 'start',
      verticalPosition: 'bottom',
      direction: 'rtl',
    });
  }
}
