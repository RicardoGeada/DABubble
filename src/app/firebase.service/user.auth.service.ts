import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, fetchSignInMethodsForEmail, signInAnonymously, signOut, onAuthStateChanged } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  firestore: Firestore = inject(Firestore);
  displayName: string = '';


  constructor(private auth: Auth) { }

  getCurrentUserId(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }

  loginUser(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  guestLogin() {
    return signInAnonymously(this.auth);
  }

  currentUser() {
    return this.auth.currentUser;
  }

  logout() {
    // this.changeStatus(false);
    return signOut(this.auth);
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

    async saveUser(name: string): Promise<void> {
      const user_auth: any = this.auth.currentUser;
      if (user_auth) {
          try {
              await updateProfile(user_auth, { displayName: name });
              this.displayName = user_auth.displayName;
          } catch (error) {
              console.error('Fehler bei updateDoc', error);
          }
      } else {
          console.error('Benutzer ist nicht authentifiziert');
      }
  }



  // async getName() {
  //     const user_auth: any = this.auth.currentUser;
  //     if (user_auth) {
  //         try {
  //             this.displayName = user_auth.displayName;
  //         } catch (error) {
  //             console.error('Fehler bei aktualisieren des displayName', error);
  //         }
  //     }
  // }

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
          // check, ob der Benutzer anonym angemeldet ist
          const isAnonymous = user.isAnonymous;
          resolve(isAnonymous);
        } else {
          resolve(false);
        }
      });
    });
  }
}
