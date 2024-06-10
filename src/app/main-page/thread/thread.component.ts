import { Component } from '@angular/core';
import { MessageService } from '../../firebase.service/message.service';
import { UserService } from '../../firebase.service/user.service';
import { ChannelFirebaseService } from '../../firebase.service/channelFirebase.service';
import { MessageComponent } from '../channel/message/message.component';
import { FormsModule } from '@angular/forms';
import { User } from '../../interfaces/user.interface';
import { Message } from '../../interfaces/message.interface';
import { ThreadService } from '../../services/thread.service';
import { MessageInputComponent } from '../message-input/message-input.component';
import { HostListener } from '@angular/core';
import { doc } from '@angular/fire/firestore';
import { SharedService } from '../../services/shared.service';


@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [MessageComponent, FormsModule, MessageInputComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent {
  currentUser: User = this.userService.currentUser;
  currentDate: string = '1970/01/01';
  messageInput: string = '';
  message: Message = {
    user_id: '',
    channel_id: '',
    thread_id: this.channelService.currentThread.id,
    message: {
      text: '',
      attachements: [],
    },
    created_at: 0,
    modified_at: 0,
    is_deleted: false,
    last_reply: 0,
  };
  weekdays = [
    'Sonntag',
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
  ];
  months = [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ];

  currenThread;


  constructor(
    public messageService: MessageService,
    public userService: UserService,
    public channelService: ChannelFirebaseService,
    public threadService: ThreadService,
    public sharedService: SharedService,
  ) {
    this.currenThread = this.userService.subCurrentUserForThread(this.userService.currentUser.id);
    this.userService.currentUserThread$.subscribe(thread_id => {
      if (thread_id && thread_id != '') {
        this.channelService.unsubCurrentThread = this.channelService.getCurrentThread(thread_id);
        this.messageService.getMessagesFromThread(thread_id);
        this.setFocus();
      }
    })
    if (this.userService.currentUser && this.userService.currentUser.last_thread == '') {
      this.closeThread();
    }
  }


  ngOnDestroy() {
    this.channelService.unsubCurrentThread();
    this.messageService.unsubMessagesThread();
    this.currenThread();
  }


  isNewDate(date: number) {
    let currentDate = this.currentDate;
    let messageDate = this.convertToDate(date);
    this.currentDate = messageDate;
    return currentDate != messageDate;
  }


  getDateFormat(dateInput: number) {
    let d = new Date(dateInput);
    let date = d.getDate();
    let day: number | string = d.getDay();
    let month: number | string = d.getMonth() + 1;
    day = this.weekdays[day];
    month = this.months[month];
    let result = day + ',' + ' ' + date + ' ' + month;
    return result;
  }

  convertToDate(dateAsNumber: number) {
    let date = new Date(dateAsNumber);
    let d: number | string = date.getDate();
    let m: number | string = date.getMonth() + 1;
    let y: number | string = date.getFullYear();
    if (d < 10) d = '0' + d;
    if (m < 10) m = '0' + m;
    let result = y + '/' + m + '/' + d;
    return result;
  }

  getTextareaPlaceholderText() {
    let channel = this.channelService.currentChannel;
    let channelType = channel.channel_type;
    let channelName = channel.name;
    let members = channel.members;
    return channelType === 'main' ? 'Nachricht an #' + channelName :
           channelType === 'direct' ? 'Nachricht an ' + (members[0] === members[1] || members.length === 1 ? 'dich' : this.getDirectChannelUser()?.name) :
           channelType === 'thread' ? 'Antworten...' : 'Starte eine neue Nachricht';
  }


  getDirectChannelUser() {
    let contact = this.channelService.currentChannel.members.find((member) => member != this.currentUser.id);
    if (contact) return this.userService.getUser(contact);
    else return this.currentUser;
  }


  closeThread() {
    this.userService.saveLastThread(this.userService.currentUser.id, '');
    this.threadService.closeThread();
  }


  setFocus() {
    document.getElementById('threadInput')?.focus();
    this.messageInput = '';
  }
}
