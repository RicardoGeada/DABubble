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
import { ChannelService } from '../../firebase.service/channel.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ThreadService } from '../../services/thread.service';
import { MessageInputComponent } from '../message-input/message-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ChannelTypeEnum } from '../../shared/enums/channel-type.enum';
import { Channel } from '../../interfaces/channel.interface';
import { OpenProfileDirective } from '../../shared/directives/open-profile.directive';
import { StateManagementService } from '../../services/state-management.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { UserAuthService } from '../../firebase.service/user.auth.service';
import { PopupNewMessageSearchComponent } from './popup-new-message-search/popup-new-message-search.component';
import { NewMessageAdresseesService } from '../../services/new-message-adressees.service';


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
    PopupNewMessageSearchComponent,
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

  inputText: string = '';

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
    public channelService: ChannelService,
    public activatedRoute: ActivatedRoute,
    private router: Router,
    public threadService: ThreadService,
    private stateService: StateManagementService,
    public userAuth: UserAuthService,
    public viewportScroller: ViewportScroller,
    public newMessageAdressees: NewMessageAdresseesService,
  ) {
    this.channelId = this.activatedRoute.snapshot.paramMap.get('channelId') ?? ''
    if (userService.currentUser) {
    this.openChannel();
    }
  }


  ngAfterViewInit() {
    this.setFocus();
    this.messageService.currentMessage.subscribe(messageId => {
      setTimeout(() => this.scrollToMessage(messageId), 0);
    });
  }


  ngOnInit() {
    if (this.userService.currentUser && this.userService.currentUser.last_channel) this.openChannel();
  }


  async scrollToMessage(messageId: string) {
    let messageElement = document.getElementById('message-' + messageId);
    while (!messageElement) {
      await new Promise(resolve => setTimeout(resolve, 100));
      messageElement = document.getElementById('message-' + messageId)
    }
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth' });
      messageElement.classList.add('blink');
    }
  }


  ngOnDestroy(): void {
    this.messageService.unsubMessages();
  }


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
        if (this.userService.currentUser.last_channel == '') {
          this.router.navigateByUrl('/main-page/');
        } else {
          this.router.navigateByUrl('/main-page/' + this.userService.currentUser.last_channel);
        }
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
    let month: number | string = d.getMonth();
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

  getChannelName(channelId: string) {
    let channel = this.getChannel(channelId);
    if (channel?.channel_type == 'direct') return this.getDirectChannelCounterPart(channelId).name;
    else return channel?.name;
  }

  getChannel(channelId: string) {
    return this.channelService.channels.find((channel) => channel.id === channelId);
  }

  getDirectChannelCounterPart(channelId: string) {
    let directChannel = this.channelService.channels.find((channel) => channel.id === channelId);
    let counterPartId = directChannel?.members.find((member) => member != this.currentUser.id);
    let counterPart = this.userService.allUsers.find((user) => user.id == counterPartId);
    if (counterPart) return counterPart;
    else return this.currentUser; // Personal Channel
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
