import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MessageComponent } from './message/message.component';
import { DialogAddMemberComponent } from './dialog-add-member/dialog-add-member.component';
import { CustomDialogService } from '../../services/custom-dialog.service';
import { DialogShowMembersComponent } from './dialog-show-members/dialog-show-members.component';
import { DialogEditChannelComponent } from './dialog-edit-channel/dialog-edit-channel.component';
import { MessageService } from '../../firebase.service/message.service';
import { Message } from '../../interfaces/message.interface';
import { FormsModule } from '@angular/forms';
import { User } from '../../interfaces/user.interface';
import { UserService } from '../../firebase.service/user.service';
import { ChannelFirebaseService } from '../../firebase.service/channelFirebase.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ThreadService } from '../../services/thread.service';
import { MessageInputComponent } from '../message-input/message-input.component';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';
import { ChannelTypeEnum } from '../../shared/enums/channel-type.enum';
import { Channel } from '../../interfaces/channel.interface';
import { SearchService } from '../../services/search.service';
import { OpenProfileDirective } from '../../shared/directives/open-profile.directive';
import { StateManagementService } from '../../services/state-management.service';
import { PopupSearchComponent } from '../../shared/popup-search/popup-search.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UserAuthService } from '../../firebase.service/user.auth.service';


@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [
    CommonModule,
    MessageComponent,
    FormsModule,
    MessageInputComponent,
    ReactiveFormsModule,
    OpenProfileDirective,
    RouterModule,
    MatProgressBarModule,
    PopupSearchComponent,
  ],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss',
})
export class ChannelComponent {
  @ViewChild(MessageInputComponent) messageInputComponent!: MessageInputComponent;

  messageInput: string = '';
  currentUser: User = this.userService.currentUser;
  channelMembers = this.channelService.currentChannel.members;
  users: User[] = this.userService.allUsers.filter((user) =>
    this.channelMembers.includes(user.id)
  );
  message: Message = {
    user_id: '',
    channel_id: this.channelService.currentChannel.id,
    message: {
      text: '',
      attachements: [],
    },
    created_at: 0,
    modified_at: 0,
    is_deleted: false,
    last_reply: 0,
  };
  channelId: string = '';
  isLoading = false;
  inputText : string = '';

  // searchControl = new FormControl();
  // private subscriptions = new Subscription();
  // filteredUsers: User[] = [];
  // filteredChannels: Channel[] = [];
  // selectedUserId: string = '';

  newDirectChannel: Channel = {
    id: '',
    name: 'Direct Channel',
    description: '',
    created_at: new Date().getTime(),
    creator: '',
    members: [],
    active_members: [],
    channel_type: ChannelTypeEnum.direct,
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

  constructor(
    public customDialogService: CustomDialogService,
    public messageService: MessageService,
    public userService: UserService,
    public channelService: ChannelFirebaseService,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public threadService: ThreadService,
    private stateService: StateManagementService,
    public searchService: SearchService,
    public userAuth: UserAuthService,
    public viewportScroller: ViewportScroller,
  ) {
    this.channelId = this.activatedRoute.snapshot.paramMap.get('channelId') ?? ''
    this.initUserAndChannel();
  }


  async initUserAndChannel() {
    if (this.userService.currentUser && this.userService.currentUser.last_channel == '') {
      this.channelId = this.activatedRoute.snapshot.paramMap.get('channelId') || '';
      this.router.navigateByUrl('/main-page/');
    }
    if (this.userService.currentUser && this.userService.currentUser.last_channel != '') {
      this.router.navigateByUrl('/main-page/' + this.userService.currentUser.last_channel);
      this.openChannel();
    }
    if (this.userService.currentUser && this.channelService.currentChannel.members.includes(this.userService.currentUser.id)) {
      this.router.navigateByUrl('/main-page/');
    }
  }


  ngAfterViewInit() {
    this.setFocus();
    this.messageService.currentMessage.subscribe(messageId => {
      setTimeout(() => this.scrollToMessage(messageId), 0);
    });
  }


  ngOnInit() {
    if (this.userService.currentUser && this.userService.currentUser.last_channel) {
      this.openChannel();
    }
    // this.subscriptions.add(
    //   this.searchControl.valueChanges
    //     .pipe(debounceTime(300))
    //     .subscribe((value) => {
    //       this.filter(value);
    //     })
    // );

  }


  async scrollToMessage(messageId: string) {
    let messageElement = document.getElementById('message-' + messageId);
    while (!messageElement) {
      await new Promise(resolve => setTimeout(resolve, 100));
      messageElement = document.getElementById('message-' + messageId);
    }
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth' });
      messageElement.classList.add('blink');
    }
  }


  ngOnDestroy(): void {
    // this.subscriptions.unsubscribe();
    this.messageService.unsubMessages();
  }

  // clearSearch(): void {
  //   this.searchControl.setValue('');
  // }


  // --------------------------------------------------
  // filter(searchTerm: string): void {
  //   if (searchTerm.startsWith('@')) {
  //     this.filteredUsers = this.searchService.filterUsersByPrefix(searchTerm, this.userService.allUsers);
  //     this.filteredChannels = [];
  //   } else if (searchTerm.startsWith('#')) {
  //     this.filteredChannels = this.searchService.filterChannelsByTypeAndPrefix(searchTerm, ChannelTypeEnum.main);
  //     this.filteredUsers = [];
  //   } else {
  //     const results = this.searchService.clearFilters();
  //     this.filteredUsers = results.users;
  //     this.filteredChannels = results.channels;
  //   }
  // }


  async openDirectChannel(user_id: string): Promise<void> {
    let channel_id = this.channelService.getDirectChannelId(this.userService.currentUser.id, user_id);
    this.channelService.getCurrentChannel(channel_id);
    if (channel_id != '') {
      this.router.navigateByUrl('/main-page/' + channel_id);
    } else {
      channel_id = await this.createNewDirectChannel(user_id);
      this.router.navigateByUrl('/main-page/' + channel_id);
    }
    this.closeThread();
    this.stateService.setSelectedUserId(user_id);
  }


  async createNewDirectChannel(user_id: string) {
    this.newDirectChannel.creator = this.userService.currentUser.id;
    this.newDirectChannel.created_at = new Date().getTime();
    this.newDirectChannel.members = [this.userService.currentUser.id, user_id];
    return await this.channelService.addChannel(this.newDirectChannel);
  }


  async openChannel() {
    this.activatedRoute.params.subscribe((params) => {
      if (params['channelId']) {
        this.loadChannelData(params['channelId']);
      } else {
        this.loadChannelData(this.userService.currentUser.last_channel);
      }
    });
  }


  loadChannelData(channelId: string) {
    this.isLoading = true;
    const loadChannel = this.channelService.getCurrentChannel(channelId);
    const loadMessages = this.messageService.getMessagesFromChannel(channelId);
    const updateUser = this.userService.updateLastChannel(this.userService.currentUser.id, channelId);
    Promise.all([loadChannel, loadMessages, updateUser])
      .then(() => {
        this.isLoading = false;
        this.setFocus();
      })
  }


  openAddUserDialog(button: HTMLElement) {
    const component = DialogAddMemberComponent;
    this.customDialogService.openDialogAbsolute({ button, component, position: 'right', maxWidth: '554px' });
  }


  openShowMembersDialog(button: HTMLElement, mobileButton: HTMLElement) {
    const component = DialogShowMembersComponent;
    this.customDialogService.openDialogAbsolute({ button, component, position: 'right', mobileButton, maxWidth: '415px' });
  }


  openEditChannelDialog(button: HTMLElement) {
    const component = DialogEditChannelComponent;
    this.customDialogService.openDialogAbsolute({ button, component, position: 'left', mobilePosition: 'mid', maxWidth: '872px' });
  }


  isMobile() {
    return window.innerWidth <= 768;
  }


  isNewDate(oldDate: number, newDate: number) {
    let oldDateAsString = this.convertToDate(oldDate);
    let newDateAsString = this.convertToDate(newDate);
    return oldDateAsString != newDateAsString;
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


  getDirectChannelUser() {
    let contact = this.channelService.currentChannel.members.find(
      (member) => member != this.currentUser.id
    );
    if (contact) return this.userService.getUser(contact);
    else return this.currentUser;
  }


  getChannelCreationTime() {
    let date = new Date(this.channelService.currentChannel.created_at);
    let d: number | string = date.getDate();
    let m: number | string = date.getMonth();
    let y = date.getFullYear();
    if (
      this.convertToDate(new Date().getTime()) ==
      this.convertToDate(this.channelService.currentChannel.created_at)
    ) {
      return 'heute';
    } else {
      return 'am' + ' ' + d + '. ' + this.months[m] + ' ' + y;
    }
  }


  getTextareaPlaceholderText() {
    const { currentChannel } = this.channelService;
    const { channel_type, members, name } = currentChannel;
    if (channel_type === 'main') {
      return `Nachricht an #${name}`;
    }
    if (channel_type === 'direct') {
      return `Nachricht an ${members.length === 2 ? this.getDirectChannelUser()?.name : 'dich'}`;
    }
    if (channel_type === 'thread') {
      return 'Antworten...';
    }
    return 'Starte eine neue Nachricht';
  }


  async setFocus() {
    if (this.messageInputComponent) {
      await this.messageInputComponent.setFocusOnInput();
    }
  }


  updateInput(newContent: string) {
    this.messageInput = newContent;
  }


  closeThread() {
    this.userService.saveLastThread(this.userService.currentUser.id, '');
    this.threadService.closeThread();
  }
}
