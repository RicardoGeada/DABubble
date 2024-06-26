import { Injectable, inject } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  getAuth,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  updateEmail,
  verifyPasswordResetCode,
} from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  verifyBeforeUpdateEmail,
  EmailAuthProvider,
} from 'firebase/auth';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserAuthService {
  firestore: Firestore = inject(Firestore);
  displayName: string = '';
  googleName: any = '';
  googleEmail: any = '';
  googleProfileImg: any = '';

  constructor(
    public auth: Auth,
    public userService: UserService,
    private router: Router
  ) {}

  //#region Sign In
  async loginUser(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  guestLogin() {
    return signInAnonymously(this.auth);
  }

  emailExists(email: any) {
    return fetchSignInMethodsForEmail(this.auth, email);
  }

  async changeCurrentUser(name?: any, email?: any) {
    const user = this.auth.currentUser;
    if (email) {
      await verifyBeforeUpdateEmail(user!, email);
      // this.logout();
    }
    if (name) {
      await updateProfile(user!, { displayName: name });
      await this.userService.updateUserName(
        this.userService.currentUser.id,
        name
      );
      this.router.navigate(['/main-page']);
    }
  }


  async currentUser() {
    return this.auth.currentUser;
  }

  logout() {
    return signOut(this.auth);
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider).then((result) => {
      let user = result.user;
      this.googleName = user.displayName;
      this.googleEmail = user.email;
      this.googleProfileImg = user.photoURL;
    });
  }

  async saveUser(name: string): Promise<void> {
    const user_auth: any = this.auth.currentUser;
    if (user_auth) {
      await updateProfile(user_auth, { displayName: name });
      this.displayName = user_auth.displayName;
    }
  }

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(this.auth, email);
  }

  async changePassword(newPassword: string, oobCode: string) {
    const auth = getAuth();
    const email = await verifyPasswordResetCode(auth, oobCode);
    await confirmPasswordReset(auth, oobCode, newPassword);
  }

  async registerUser(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async checkEmailExistence(email: string) {
    return fetchSignInMethodsForEmail(this.auth, email);
  }

  checkAuth() {
    return new Promise<boolean>(async (resolve, reject) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }

  checkAuthLoggedInAsGuest() {
    return new Promise<boolean>((resolve, reject) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          const isAnonymous = user.isAnonymous;
          resolve(isAnonymous);
        } else {
          resolve(false);
        }
      });
    });
  }

  async checkActionCode(oobCode: string) {
    console.log('check', this.auth, oobCode);
    return checkActionCode(this.auth, oobCode);
  }

  async applyActionCode(actionCode: string) {
    console.log('apply', this.auth, actionCode);
    return applyActionCode(this.auth, actionCode)
      .catch((error) => {
        throw error;
      });
  }

  async verifyEmail() {
    if (this.auth.currentUser)
      await sendEmailVerification(this.auth.currentUser);
  }
}
