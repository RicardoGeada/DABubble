import { Inject, Injectable, OnDestroy, inject } from '@angular/core';
import { Firestore, collection, onSnapshot, DocumentData, addDoc, doc, updateDoc, deleteDoc, getDoc, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { User } from '../models/user';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';


@Injectable({
    providedIn: 'root'
})

export class UserService implements OnDestroy {
    firestore: Firestore = inject(Firestore);
    allUsers: any[] = [];
    user = new User();
    currentUser: any;

    unsubUsers;

    constructor() {
            this.unsubUsers = this.getUsers()
    }

    getUsers() {
        return onSnapshot(this.getUserRef(), (list) => {
            this.allUsers = [];
            list.forEach((element) => {
                let id = element.id;
                let data = element.data();
                // let userData = { id, data };
                this.allUsers.push(this.setUsers(data, id));
            });
            console.log("Benutzerdaten geladen: ", this.allUsers);
        });
    }

    setUsers(data: any, id?: string) : User {
        return {
            id: id || '',
            name: data.name || '',
            email: data.email || '',
            password: '',
            logged_in: data.logged_in || false,
            is_typing: data.is_typing || false,
            profile_img: data.profile_img || '',
            // last_channel: data.last_channel || ''
            toJSON() {
                return {
                    id: this.id,
                    name: this.name,
                    email: this.email,
                    password: this.password,
                    logged_in: this.logged_in,
                    is_typing: this.is_typing,
                    profile_img: this.profile_img
                };
            }
        }
    
    }

    addDatabaseIdToUser(userId: string) {
        let singleUserRef = doc(this.getUserRef(), userId);
        updateDoc(singleUserRef, {id: userId});
    }

    getCurrentUser(email: string) {
        this.currentUser = this.allUsers.find(user => user.email === email);
        console.log('Benutzer gefunden:', this.currentUser);
    }

    getCurrentUserId(): string | null {
        return this.currentUser ? this.currentUser.uid : null;
      }
    // getCurrentUser(email: string) {
    //     console.log("Suche nach Benutzer mit E-Mail: ", email);
    //     console.log("Verfügbare Benutzer: ", this.allUsers);
    //     let user = this.allUsers.find(user => user.email === email);
    //     if (user) {
    //         this.currentUser = user;
    //         console.log('Benutzer gefunden:', this.currentUser);
    //     } else {
    //         console.error('Kein Benutzer mit dieser E-Mail gefunden.');
    //         this.currentUser = null;  // Sicherstellen, dass kein ungültiger Zustand bleibt
    //     }
    // }
    

    // Methode, um den aktuellen Benutzer basierend auf einer Benutzer-ID zu laden
// loadCurrentUser(userId: string) {
//     const userRef = this.getSingleUserRef(userId);
//     return onSnapshot(userRef, (doc) => {
//         if (doc.exists()) {
//             this.currentUser = { id: doc.id, ...doc.data() } as User;
//         } else {
//             console.error('Kein Benutzer gefunden.');
//             this.currentUser = null;
//         }
//     }, (error) => {
//         console.error('Fehler beim Laden des Benutzers:', error);
//         this.currentUser = null;
//     });
// }

    

    ngOnDestroy(): void {
        this.unsubUsers();
    }

    getUserRef() {
        return collection(this.firestore, 'users');
    }

    getSingleUserRef(userId: string) {
        return doc(collection(this.firestore, 'users'), userId);
    }

    async addUser(user: User){
        await addDoc(this.getUserRef(), user.toJSON());
    }

    addAvatarToUser(userId: string, avatar: string){
        let singleUserRef = doc(this.getUserRef(), userId);
        updateDoc(singleUserRef, {profile_img: avatar});
    }

    updatePassword(userId: string, password: string){
        // let singleUserRef = doc(this.getUserRef(), userId);
        // updateDoc(singleUserRef, {password: password});

        // kein pw in database
    }

    updateOnlineStatus(userId: string, status: boolean){
        let singleUserRef = doc(this.getUserRef(), userId);
        updateDoc(singleUserRef, {logged_in: status});
    }

    getCleanJson(user: User):{}{
        return {
            name: user.name,
            email: user.email,
            password: '',
            logged_in: user.logged_in,
            is_typing: user.is_typing,
            profile_img: user.profile_img,
            // last_channel: userInt.last_channel
        }
    }

    uploadImage(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
          const storage = getStorage();
          const storageRef = ref(storage, 'images/' + file.name);
          const uploadTask = uploadBytesResumable(storageRef, file);
          uploadTask.on('state_changed', 
            (snapshot) => {
              // use this section to display the upload progress
            }, 
            (error) => {
              reject(error);
            }, 
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                resolve(downloadURL);
              });
            }
          );
        });
      }

    async loadUser(userId: string){
        this.getSingleUserRef(userId);
    }

    async deleteUser(userId: string){
        try{
            await deleteDoc(doc(this.firestore, "users", userId));
        }
         catch (error) {
            console.error("Error removing document: ", error);
        }
    }

    
}