import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  where,
  query,
  orderBy,
  deleteDoc,
  getDocs,
} from '@angular/fire/firestore';
import { Message } from '../interfaces/message.interface';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { deleteObject, getMetadata } from '@angular/fire/storage';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private messageSource = new Subject<string>();
  currentMessage = this.messageSource.asObservable();
  firestore: Firestore = inject(Firestore);
  messages: Message[] = [];
  allMessages: any[] = [];
  messagesThread: Message[] = [];
  message: Message = {
    user_id: '',
    channel_id: '',
    thread_id: '',
    message: {
      text: '',
      reactions: [],
      attachements: [],
    },
    created_at: 0,
    modified_at: 0,
    is_deleted: false,
    total_replies: 0,
  };
  unsubMessages = () => { };
  unsubMessagesThread = () => { };
  unsubAllMessages;

  constructor() {
    this.unsubAllMessages = this.subAllMessages();
  }


  changeMessage(messageId: any) {
    this.messageSource.next(messageId);
  }


  ngOnDestroy() {
    this.unsubMessages();
    this.unsubMessagesThread();
    this.unsubAllMessages();
  }


  getMessagesFromChannel(channel_id: any) {
    this.unsubMessages = this.subMessages(channel_id);
  }


  getMessagesFromThread(thread_id: any) {
    this.unsubMessagesThread = this.subMessagesThread(thread_id);
  }


  getMessagesRef() {
    return collection(this.firestore, 'messages');
  }


  getMessageRef(message_id: string) {
    return doc(collection(this.firestore, 'messages', message_id));
  }


  setMessage(data: any, id?: string): Message {
    return {
      id: id || '',
      user_id: data.user_id || '',
      channel_id: data.channel_id || '',
      thread_id: data.thread_id || '',
      message: {
        text: data.message.text || '',
        reactions: data.message.reactions || [],
        attachements: data.message.attachements || [],
      },
      created_at: data.created_at || 0,
      modified_at: data.modified_at || 0,
      is_deleted: data.is_deleted || false,
      total_replies: data.total_replies || 0,
      last_reply: data.last_reply || 0,
    };
  }


  /* CREATE */
  async addMessage(message: Message) {
    let ref = this.getMessagesRef();
    const docRef = await addDoc(ref, message);
    return docRef.id;
  }


  /* READ */
  subMessages(channel_id: string) {
    const q = query(
      this.getMessagesRef(),
      where('channel_id', '==', channel_id),
      orderBy('created_at')
    );
    return onSnapshot(q, (messages) => {
      this.messages = [];
      messages.forEach((message) => {
        this.messages.push(this.setMessage(message.data(), message.id));
      });
    });
  }


  subMessagesThread(thread_id: string) {
    const q = query(
      this.getMessagesRef(),
      where('thread_id', '==', thread_id),
      orderBy('created_at')
    );
    return onSnapshot(q, (messages) => {
      this.messagesThread = [];
      messages.forEach((message) => {
        this.messagesThread.push(this.setMessage(message.data(), message.id));
      });
    });
  }


  subAllMessages() {
    const q = query(this.getMessagesRef(), orderBy('created_at'));
    return onSnapshot(q, (messages) => {
      this.allMessages = [];
      messages.forEach((message) => {
        this.allMessages.push(this.setMessage(message.data(), message.id));
      });
    });
  }


  /* UPDATE */
  async updateMessage(message: Message) {
    if (message.id) {
      let docRef = doc(this.getMessagesRef(), message.id);
      await updateDoc(docRef, JSON.parse(JSON.stringify(message))).catch(
        (err) => console.error(err)
      );
    }
  }


  /* STORAGE */
  uploadFile(file: File, path: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed', (snapshot) => { },
        (error) => {
          reject(error);
        }, () => {
          resolve();
        }
      );
    });
  }


  async getFileData(path: string) {
    const storage = getStorage();
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    const metadata = await getMetadata(storageRef);
    return {
      path: path,
      name: metadata.name,
      type: metadata.contentType,
      url: url,
    };
  }


  async downloadFile(path: string) {
    const storage = getStorage();
    const storageRef = ref(storage, path);
    const metadata = await getMetadata(storageRef);
    const url = await getDownloadURL(storageRef);
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Netzwerkantwort war nicht ok.');
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    this.createElement(blobUrl, metadata);
  }


  createElement(blobUrl: string, metadata: any){
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = metadata.name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  }


  deleteFile(path: string) {
    const storage = getStorage();
    const storageRef = ref(storage, path);
    deleteObject(storageRef);
  }


  async removeThreadMessagesFromChannel(threadId: string) {
    const q = query(this.getMessagesRef(), where('thread_id', '==', threadId));
    const querySnapshot = await getDocs(q);
    for (let doc of querySnapshot.docs) {
      await deleteDoc(doc.ref);
    }
  }


  async removeMessagesFromEmptyChannel(channelId: string) {
    const q = query(this.getMessagesRef(), where('channel_id', '==', channelId));
    const querySnapshot = await getDocs(q);
    for (let doc of querySnapshot.docs) {
      await deleteDoc(doc.ref);
    }
  }
}
