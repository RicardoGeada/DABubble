import { Injectable, OnDestroy, inject } from '@angular/core';
import { Firestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, Subject } from 'rxjs';
import { User } from '../models/user';
import { getDownloadURL, getStorage, ref, uploadBytesResumable, } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class UserService implements OnDestroy {
  firestore: Firestore = inject(Firestore);
  allUsers: any[] = [];
  user = new User();
  currentUser: any;
  currentUserThread$ = new Subject<string>();
  unsubUsers;

  constructor() {
    this.unsubUsers = this.getUsers();
    this.getCurrentUser();
  }


  getUser(user_id: string) {
    return this.allUsers.find((user) => user.id == user_id);
  }


  getUsersByIds(ids: string[]): User[] {
    return ids
      .map((id) => this.getUser(id))
      .filter((user) => user !== undefined);
  }


  getUsers() {
    return onSnapshot(this.getUserRef(), (list) => {
      this.allUsers = [];
      list.forEach((element) => {
        let id = element.id;
        let data = element.data();
        this.allUsers.push(this.setUsers(data, id));
      });
    });
  }


  subCurrentUserForThread(user_id: string) {
    return onSnapshot(this.getSingleUserRef(user_id), (user) => {
      let threadId = this.setUsers(user.data(), user.id).last_thread || '';
      this.currentUserThread$.next(threadId);
    });
  }


  setUsers(data: any, id: string): User {
    return {
      id: id,
      name: data.name || '',
      email: data.email || '',
      password: '',
      logged_in: data.logged_in || false,
      is_typing: data.is_typing || false,
      profile_img: data.profile_img,
      last_channel: data.last_channel || '',
      last_thread: data.last_thread || '',
      toJSON() {
        return {
          id: this.id,
          name: this.name,
          email: this.email,
          password: this.password,
          logged_in: this.logged_in,
          is_typing: this.is_typing,
          profile_img: this.profile_img,
          last_channel: this.last_channel,
          last_thread: this.last_thread,
        };
      },
    };
  }


  addDatabaseIdToUser(userId: string) {
    let singleUserRef = doc(this.getUserRef(), userId);
    updateDoc(singleUserRef, { id: userId });
  }


  async getCurrentUser(email?: string): Promise<User | null> {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedUser = localStorage.getItem('currentUser');
      if (email) {
        this.currentUser = this.allUsers.find((user) => user.email === email);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      } else if (storedUser) {
        this.currentUser = JSON.parse(storedUser);
      }
      return this.currentUser || null;
    }
    return null;
  }


  ngOnDestroy(): void {
    this.unsubUsers();
    this.currentUserThread$.unsubscribe();
  }


  getUserRef() {
    return collection(this.firestore, 'users');
  }


  getSingleUserRef(userId: string) {
    return doc(collection(this.firestore, 'users'), userId);
  }


  async addUser(user: User) {
    await addDoc(this.getUserRef(), user.toJSON());
  }


  addAvatarToUser(userId: string, avatar: string) {
    let singleUserRef = doc(this.getUserRef(), userId);
    updateDoc(singleUserRef, { profile_img: avatar });
  }


  async updateLastChannel(userId: string, channelId: string) {
    let singleUserRef = doc(this.getUserRef(), userId);
    await updateDoc(singleUserRef, { last_channel: channelId });
    let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    currentUser.last_channel = channelId;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }


  async updateOnlineStatus(userId: string, status: boolean) {
    let singleUserRef = doc(this.getUserRef(), userId);
    await updateDoc(singleUserRef, { logged_in: status });
    let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    currentUser.logged_in = status;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }


  async updateUserName(userId: string, name: string) {
    let singleUserRef = doc(this.getUserRef(), userId);
    await updateDoc(singleUserRef, { name: name });
    let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    currentUser.name = name;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }


  async updateUserEmail(userId: string, email: string) {
    let singleUserRef = doc(this.getUserRef(), userId);
    await updateDoc(singleUserRef, { email: email });
    let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    currentUser.email = email;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }


  async updateUserImage(userId: string, image: string) {
    let singleUserRef = doc(this.getUserRef(), userId);
    await updateDoc(singleUserRef, { profile_img: image });
    let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    currentUser.profile_img = image;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }


  async saveLastThread(userId: string, threadId: string) {
    let singleUserRef = doc(this.getUserRef(), userId);
    await updateDoc(singleUserRef, { last_thread: threadId });
    let currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    currentUser.last_thread = threadId;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }


  getCleanJson(user: User): {} {
    return {
      name: user.name,
      email: user.email,
      password: '',
      logged_in: user.logged_in,
      is_typing: user.is_typing,
      profile_img: user.profile_img,
      last_channel: user.last_channel,
      last_thread: user.last_thread,
    };
  }


  uploadImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const storageRef = ref(storage, 'images/' + file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed',(snapshot) => {},
        (error) => { reject(error);
         }, () => {getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  }


  async loadUser(userId: string) {
    this.getSingleUserRef(userId);
  }


  async deleteUser(userId: string) {
      await deleteDoc(doc(this.firestore, 'users', userId));
  }


  async updateUser(user: User): Promise<void> {
    if (user.id) {
      const docRef = doc(this.getUserRef(), user.id);
        await updateDoc(docRef, this.getCleanJson(user));
    }
  }
  

  getRealtimeUser(userId: string): Observable<User> {
    return new Observable((observer) => {
      const userRef = doc(this.firestore, 'users', userId);
      return onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          observer.next(doc.data() as User);
        } else {
          observer.error(new Error("User not found"));
        }
      }, observer.error);
    });
  }


  async recoverEmail(currentEmail: string, restoredEmail: string) {
    const user = this.allUsers.find((user) => user.email == currentEmail);
    if (user) await this.updateUserEmail(user.id, restoredEmail);
  }

}
