import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { Message } from '../../../interfaces/message.interface';
import { User } from '../../../interfaces/user.interface';
import { MessageService } from '../../../firebase.service/message.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../firebase.service/user.service';
import { ChannelFirebaseService } from '../../../firebase.service/channelFirebase.service';
import { Channel } from '../../../interfaces/channel.interface';
import { ChannelTypeEnum } from '../../../shared/enums/channel-type.enum';
import { ThreadService } from '../../../services/thread.service';
import { DialogEmojiPickerComponent } from '../dialog-emoji-picker/dialog-emoji-picker.component';
import { CustomDialogService } from '../../../services/custom-dialog.service';
import { OpenProfileDirective } from '../../../shared/directives/open-profile.directive';
import { ReactionService } from '../../../firebase.service/reaction.service';
import { Reaction } from '../../../interfaces/reaction.interface';
import { SharedService } from '../../../services/shared.service';
import { MainPageComponent } from '../../main-page.component';
import { TagToComponentDirective } from '../../../shared/directives/tag-to-component.directive';
import { PopupSearchComponent } from '../../../shared/popup-search/popup-search.component';
import { CursorPositionService } from '../../../services/cursor-position.service';
import { EditMessageComponent } from './edit-message/edit-message.component';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [CommonModule, FormsModule, OpenProfileDirective, TagToComponentDirective, PopupSearchComponent, EditMessageComponent],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
})
export class MessageComponent {
  showMoreOptions: boolean = false;
  editMessage: boolean = false;
  @Input() channelType: 'main' | 'direct' | 'thread' | 'new' = 'main';
  @Input() message: Message = {
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
    last_reply: 0,
  };
  deleted_img: string = 'assets/img/deleted.png';
  currentUser: User = this.userService.currentUser;
  currentChannel = this.channelService.currentChannel;
  channelMembers = this.currentChannel.members;
  messageCreator: User | undefined = undefined;
  editableMessage: Message = JSON.parse(JSON.stringify(this.message));
  attachementsData: any[] = [];
  unsubReactions: Function = () => { };
  reactions: Reaction[] = [];

  @ViewChild('channelInput', { static: true }) channelInput!: ElementRef;
  @ViewChild('channelInput', { read: ViewContainerRef, static: true }) channelInputViewRef!: ViewContainerRef;
  tagText: string = '';

  constructor(
    public messageService: MessageService,
    public userService: UserService,
    public channelService: ChannelFirebaseService,
    public threadService: ThreadService,
    public customDialogService: CustomDialogService,
    public reactionService: ReactionService,
    public sharedService: SharedService,
    public elementRef: ElementRef,
    public mainpage : MainPageComponent, // TODO: als Service
    public cursorPositionService : CursorPositionService,
  ) {}
 
  get channelInputElement(): ElementRef {
    return this.channelInput;
  }


  ngOnInit() {
    this.messageCreator = this.getUser(this.message.user_id);
    this.editableMessage = JSON.parse(JSON.stringify(this.message));
    this.getAttachementsData();
    this.getReactions();
    this.message.message.text = this.formatMessageForRead(this.message.message.text);
  }
  
  ngOnChanges() {
    this.editableMessage = JSON.parse(JSON.stringify(this.message));
    if (this.attachementsData.length == 0) this.getAttachementsData();
    this.getReactions();

  }


  ngOnDestroy() {
    this.unsubReactions();
  }


  async getAttachementsData() {
    const messageAttachementsPaths = this.message.message.attachements;
    if (messageAttachementsPaths) {
      this.attachementsData = [];
      messageAttachementsPaths.forEach(async (path) => {
        if (path != 'deleted') {
          const attachement = await this.messageService.getFileData(path);
          this.attachementsData.push(attachement);
        }
      });
    }
  }


  attachementData(path: string) {
    let attachementData = this.attachementsData.find(
      (data) => data.path == path
    );
    return attachementData;
  }


  isCurrentUser(): boolean {
    return this.currentUser.id === this.message.user_id;
  }


  getUser(user_id: string) {
    return this.userService.allUsers.find((user) => user.id == user_id);
  }


  getTime(timeNumber: number) {
    let date = new Date(timeNumber);
    let h = this.addZero(date.getHours());
    let m = this.addZero(date.getMinutes());
    let time = h + ':' + m;
    return time;
  }


  addZero(i: any) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  }


  getTimeDifferenceForLastReply(dateAsNumber: number) {
    let currentDate = new Date().getTime();
    let difference = 0;
    difference = currentDate - dateAsNumber;
    let seconds = Math.floor(difference / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    let days = Math.floor(hours / 24);
    if (this.convertToDate(currentDate) == this.convertToDate(dateAsNumber)) {
      return this.getTime(dateAsNumber) + ' ' + 'Uhr';
    } else if (hours > 24 && hours < 48) {
      return 'Gestern';
    } else {
      return this.convertToDate(dateAsNumber);
    }
  }


  convertToDate(dateAsNumber: number) {
    let date = new Date(dateAsNumber);
    let d: number | string = date.getDate();
    let m: number | string = date.getMonth() + 1;
    let y: number | string = date.getFullYear();
    if (d < 10) d = '0' + d;
    if (m < 10) m = '0' + m;
    let result = d + '.' + m + '.' + y;
    return result;
  }


  //#region thread

  async openThread(thread_id: string | undefined) {
    if (this.threadService.threadOpen) {
      this.closeThread();
    }
    if (thread_id == undefined || thread_id == '') {
      let newThread: Channel = this.newThreadData();
      this.openNewThread(newThread);
      this.messageService.updateMessage(this.message);
      this.closeUnder1500();
    } else {
      this.userService.currentUser.last_thread = thread_id;
      this.userService.saveLastThread(this.userService.currentUser.id, thread_id);
      this.closeUnder1500();
    }
  }


  newThreadData() {
    return {
      id: '',
      name: this.channelService.currentChannel.name,
      description: '',
      created_at: new Date().getTime(),
      creator: this.userService.currentUser.id,
      members: [this.userService.currentUser.id],
      active_members: [],
      channel_type: ChannelTypeEnum.thread,
    };
  }


  async openNewThread(newThread: Channel) {
    let newThreadId = await this.channelService.addChannel(newThread);
    this.userService.saveLastThread(this.userService.currentUser.id, newThreadId);
    this.userService.currentUser.last_thread = newThreadId;
    this.message.thread_id = newThreadId;
  }


  closeUnder1500() {
    if (window.innerWidth < 1500) {
      this.sharedService.isMenuOpen = false;
      this.threadService.openThread();
    }
    this.threadService.openThread();
  }


  closeThread() {
    this.userService.saveLastThread(this.userService.currentUser.id, '');
    this.threadService.closeThread();
  }
  //#endregion thread


  deleteFile(path: string) {
    this.messageService.deleteFile(path);
    if (this.message.message.attachements) {
      const index = this.message.message.attachements.indexOf(path);
      if (index > -1) this.message.message.attachements[index] = 'deleted';
      this.message.modified_at = new Date().getTime();
      this.messageService.updateMessage(this.message);
    }
  }
  
  
  closeEdit() {
    this.editMessage = false;
    this.showMoreOptions = false;
  }


  //#region REACTIONS


  //#region REACTIONS
  getReactions() {
    if (this.message.message.reactions && this.message.message.reactions.length > 0) {
      let result = this.reactionService.subReactionsForMessage(this.message.id!);
      this.unsubReactions = result.snapshot;
      this.reactions = result.reactionsArray;
    }
  }


  getReactionData(reactionId: string) {
    return this.reactions.find((reaction) => reaction.id == reactionId);
  }


  openReactionPicker() {
    const component = DialogEmojiPickerComponent;
    const dialogRef = this.customDialogService.openDialog(component);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addReaction(result);
      }
    });
  }


  async addReaction(emoji: string) {
    let currentUserReaction = this.reactions.find((reaction) => reaction.users.includes(this.currentUser.id));
    let reactionWithEmoji = this.reactions.find((reaction) => reaction.unicode == emoji);
    if (currentUserReaction && currentUserReaction.unicode != emoji) this.removeCurrentUserFromReaction(currentUserReaction);
    if (reactionWithEmoji) {
      if (!currentUserReaction || currentUserReaction != reactionWithEmoji) this.addCurrentUserToReaction(reactionWithEmoji);
    } else {
      this.createNewReaction(emoji);
    }
  }


  async createNewReaction(emoji: string) {
    let newReaction: Reaction = this.getNewReactionData(emoji);
    const reactionId = await this.reactionService.addReaction(newReaction);
    this.message.message.reactions?.push(reactionId);
    this.messageService.updateMessage(this.message);
  }


  getNewReactionData(emoji: string) {
    return {
      id: '',
      message_id: this.message.id!,
      users: [this.currentUser.id],
      unicode: emoji,
      created_at: new Date().getTime(),
      lastTimeUsed: new Date().getTime(),
    };
  }


  addCurrentUserToReaction(reaction: Reaction) {
    if (reaction.users.length == 0) reaction.created_at = new Date().getTime();
    reaction.users.push(this.currentUser.id);
    if (!this.message.message.reactions?.includes(reaction.id)) {
      this.message.message.reactions?.push(reaction.id);
      this.messageService.updateMessage(this.message);
    }
    reaction.lastTimeUsed = new Date().getTime();
    this.reactionService.updateReaction(reaction);
  }


  removeCurrentUserFromReaction(reaction: Reaction) {
    let index = reaction.users.indexOf(this.currentUser.id);
    reaction.users.splice(index, 1);
    if (reaction.users.length == 0) {
      let reactionIdIndex = this.message.message.reactions?.indexOf(reaction.id);
      if (reactionIdIndex != undefined) {
        this.message.message.reactions?.splice(reactionIdIndex, 1);
        this.messageService.updateMessage(this.message);
      }
    }
    this.reactionService.updateReaction(reaction);
  }


  toggleReaction(reaction: Reaction) {
    if (reaction.users.includes(this.currentUser.id)) {
      this.removeCurrentUserFromReaction(reaction);
    } else {
      this.addReaction(reaction.unicode);
    }
  }



  getUserName(userId: string) {
    let user = this.userService.allUsers.find((user) => user.id == userId);
    return user ? user.name : 'Gelöschter Nutzer';
  }


  sortedReactionsByLastTimeUsed() {
    let filteredReactionsForNoUsers = [...this.reactions].filter((reaction) => reaction.users.length > 0)
    let sortedByLastTimeUsed = filteredReactionsForNoUsers.sort((a, b) => b.lastTimeUsed - a.lastTimeUsed);
    return sortedByLastTimeUsed;
  }

  //#endregion



  //#region formatting
  // TODO: delete?
  escapeHTML(text : string) {
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  formatMessageForRead(text : string) {
   let formattedText = this.escapeHTML(text);
   return formattedText;
  }

  //#endregion

}
