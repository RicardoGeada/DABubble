import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserAuthService } from '../../firebase.service/user.auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../firebase.service/user.service';

@Component({
  selector: 'app-auth-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-email.component.html',
  styleUrl: './auth-email.component.scss',
})
export class AuthEmailComponent {
  title: string = '';
  notification: string = '';
  error: string = '';

  constructor(
    private userAuth: UserAuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const mode = params['mode'];
      const actionCode = params['oobCode'];
      if (mode === 'verifyEmail') this.handleVerifyEmail(actionCode);
      if (mode === 'verifyAndChangeEmail')
        this.handleVerifyAndChangeEmail(actionCode);
      if (mode === 'recoverEmail') this.handleRecoverEmail(actionCode);
    });
  }

  handleVerifyEmail(actionCode: string) {
    this.title = 'Email verifizieren';
    this.userAuth
      .applyActionCode(actionCode)
      .then((resp) => {
        this.notification = 'Deine Email wurde verifiziert.';
      })
      .catch((error) => {
        this.error =
          'Deine Email konnte nicht verifiziert werden. Bitte versuche es erneut.';
        this.userAuth.verifyEmail();
      });
  }

  handleVerifyAndChangeEmail(actionCode: string) {
    this.title = 'Email ändern';
    this.userAuth.checkActionCode(actionCode).then((info) => {
      return this.userAuth
        .applyActionCode(actionCode)
        .then(async (resp) => {
          await this.userService.updateUserEmail(
            this.userService.currentUser.id,
            info.data.email!
          );
          this.notification = `Deine Email wurde von ${info.data.previousEmail} zu ${info.data.email} geändert.`;
        })
        .catch((error) => {
          this.error =
            'Deine Email konnte nicht geändert werden. Bitte versuche es erneut.';
        });
    });
  }

  handleRecoverEmail(actionCode: string) {
    this.title = 'Email zurücksetzen';
    let restoredEmail = '';
    let previousEmail = '';
    // Confirm the action code is valid.
    this.userAuth
      .checkActionCode(actionCode)
      .then((info) => {
        // Get the restored email address.
        restoredEmail = info.data.email!;
        previousEmail = info.data.previousEmail!;
        // Revert to the old email.
        return this.userAuth.applyActionCode(actionCode);
      })
      .then(() => {
        // Change User Email
        if (previousEmail != '' && restoredEmail != '') this.userService.recoverEmail(previousEmail, restoredEmail);
        this.notification = `Deine Email wurde auf ${restoredEmail} zurückgesetzt.`;
        if (restoredEmail != '')
          this.userAuth
            .resetPassword(restoredEmail)
            .then(() => this.notification += ' Wir haben dir eine Email geschickt, damit du dein Passwort ändern kannst.')
            .catch((error) => {});
      })
      .catch((error) => {
        // Invalid code.
        console.log(error);
        this.error = 'Ups, da ist wohl etwas schiefgelaufen.';
      });
  }

  backToLogin() {
    this.router.navigate(['/login-page/login']);
  }
}
