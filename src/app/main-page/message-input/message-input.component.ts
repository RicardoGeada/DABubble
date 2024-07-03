import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelService } from '../../firebase.service/channel.service';
import { UserService } from '../../firebase.service/user.service';
import { User } from '../../interfaces/user.interface';
import { Message } from '../../interfaces/message.interface';
import { MessageService } from '../../firebase.service/message.service';
import { CustomDialogService } from '../../services/custom-dialog.service';
import { DialogEmojiPickerComponent } from '../channel/dialog-emoji-picker/dialog-emoji-picker.component';
import { PopupSearchComponent } from '../../shared/popup-search/popup-search.component';
import { TagToComponentDirective } from '../../shared/directives/tag-to-component.directive';
import { CursorPositionService } from '../../services/cursor-position.service';
import { ActivatedRoute } from '@angular/router';
import { NewMessageAdresseesService } from '../../services/new-message-adressees.service';
import { PasteAsTextDirective } from '../../shared/directives/paste-as-text.directive';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule, PopupSearchComponent, TagToComponentDirective, PasteAsTextDirective],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
})
export class MessageInputComponent {
  @Input() usedIn: 'channel' | 'thread' = 'channel';
  @ViewChild('channelInput', { static: true }) channelInput!: ElementRef;
  @ViewChild('channelInput', { read: ViewContainerRef, static: true })
  channelInputViewRef!: ViewContainerRef;
  @ViewChild('addDocumentInput') addDocumentInput!: HTMLInputElement;

  messageInput: string = '';
  currentUser: User = this.userService.currentUser;
  message: Message = {
    user_id: '',
    channel_id: '',
    message: {
      text: '',
      attachements: [],
    },
    created_at: 0,
    modified_at: 0,
    is_deleted: false,
    last_reply: 0,
  };
  currentFile: any | null = null;
  errorMessage: string = '';

  tagText: string = '';


  constructor(
    public userService: UserService,
    public channelService: ChannelService,
    public messageService: MessageService,
    public customDialogService: CustomDialogService,
    public cursorPositionService: CursorPositionService,
    public route: ActivatedRoute,
    public newMessageAdressees: NewMessageAdresseesService,
  ) {}


  get channelInputElement(): ElementRef {
    return this.channelInput;
  }


  ngOnInit() {
    this.route.params.subscribe(params => {
      const channelId = params['channelId'];
      this.channelInput.nativeElement.innerText = '';
    });
  }


  //#region save message
  async saveMessage(channelInput: HTMLDivElement, fileInput: HTMLInputElement) {
    if (this.messageInput != '' || this.currentFile != null || channelInput.innerHTML != '') {
      if(this.hasAdressees()) {
        this.prepareMessageForSave(channelInput);
        this.emptyInput(channelInput);
        if(this.isNewMessageChannel()) this.sendToAllAdressees(fileInput);
        else this.sendToCurrentChannel(fileInput);
      }
    }
  }


  hasAdressees() {
    return this.channelService.currentChannel.channel_type != 'new' || (this.channelService.currentChannel.channel_type == 'new' && this.newMessageAdressees.adressees.length > 0)
  }


  isNewMessageChannel() {
    return this.channelService.currentChannel.channel_type == 'new';
  }


  async sendToAllAdressees(fileInput : HTMLInputElement) {
    this.newMessageAdressees.adressees.forEach( async (channelId) => {
      this.message.channel_id = channelId;
      this.message.id = await this.messageService.addMessage(this.message);
      if (this.currentFile != null) await this.uploadFile(fileInput);
    })
    this.newMessageAdressees.empty();
  }


  async sendToCurrentChannel(fileInput: HTMLInputElement) {
    this.message.id = await this.messageService.addMessage(this.message);
    if (this.usedIn == 'thread') this.updateThreadMessage();
    if (this.currentFile != null) await this.uploadFile(fileInput);
  }

  
  prepareMessageForSave(channelInput : HTMLDivElement) {
    this.message.user_id = this.currentUser.id;
    channelInput.innerHTML = this.formatMessageForSave(channelInput.innerHTML);
    this.message.message.text = channelInput.innerText;
    this.message.created_at = new Date().getTime();
    this.message.modified_at = this.message.created_at;
    if (this.usedIn == 'channel')
      this.message.channel_id = this.channelService.currentChannel.id;
    if (this.usedIn == 'thread')
      this.message.thread_id = this.channelService.currentThread.id;
  }


  emptyInput(channelInput : HTMLDivElement) {
    this.messageInput = '';
    channelInput.innerText = '';
  }
  

  updateThreadMessage() {
    let threadMessages = this.messageService.messagesThread;
    let threadMessage = this.messageService.messagesThread[0];
    threadMessage.total_replies = threadMessages.length - 1;
    threadMessage.last_reply = this.message.created_at;
    this.messageService.updateMessage(threadMessage);
  }


  async uploadFile(fileInput : HTMLInputElement) {
    const path = 'users/' + this.currentUser.id + '/messages/' + this.message.id + '/' + this.currentFile.name;
    await this.messageService.uploadFile(this.currentFile, path);
    this.message.message.attachements = [];
    this.message.message.attachements.push(path);
    await this.messageService.updateMessage(this.message);
    this.removeFile(fileInput);
  }


  //#region placeholder
  getDirectChannelUser() {
    let contact = this.channelService.currentChannel.members.find(
      (member) => member != this.currentUser.id
    );
    if (contact) return this.userService.getUser(contact);
    else return this.currentUser;
  }


  getTextareaPlaceholderText() {
    if(this.usedIn == 'thread') return 'Antworten...';
    switch (this.channelService.currentChannel.channel_type) {
      case 'main': return 'Nachricht an ' + '#' + this.channelService.currentChannel.name;
      case 'direct':
        if (this.channelService.currentChannel.members.length == 2) return 'Nachricht an ' + this.getDirectChannelUser()?.name;
        else return 'Nachricht an ' + 'dich';    
      case 'thread': return 'Antworten...';
      case 'new': return 'Starte eine neue Nachricht';
      default: return 'Starte eine neue Nachricht';
    }
  }


 //#region file add / remove
  addDocument(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      this.currentFile = file;
      this.currentFile.URL = this.createURL(file);
      if (file.size > 500 * 1024) this.checkIfFileIsTooBig();
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) this.wrongFileType();
    }
  }


  checkIfFileIsTooBig(){
      this.currentFile = null;
      this.errorMessage = 'Die Datei ist zu groß. Max. 500KB.';
      setTimeout(() => this.errorMessage = '', 5000);
  }


  wrongFileType() {
    this.currentFile = null;
    this.errorMessage = 'Ungültiger Dateityp. Bitte wählen Sie eine Bild- oder PDF-Datei.';
    setTimeout(() => this.errorMessage = '', 5000);
  }


  createURL(file: File) {
    return URL.createObjectURL(file);
  }


  removeFile(input: HTMLInputElement) {
    this.currentFile = null;
    input.value = '';
    this.message.message.attachements = [];
  }


  //#region emoji
  openDialogEmojiPicker(input: HTMLDivElement) {
    const component = DialogEmojiPickerComponent;
    const dialogRef = this.customDialogService.openDialog(component);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.addEmoji(input, result);
      }
    });
  }


  addEmoji(input : HTMLElement, result : any) {
    if(document.activeElement !== input)  this.setFocusAtTextEnd(input);
    this.insertAtCursor(result, input);
  }


  //#region @ Tag System
  checkForTag(element: HTMLElement) {
    const text = this.getTextWithLineBreaks(element);
    const cursorPosition = this.setSelectionPosition(element);
    const textBeforeCursor = text.slice(0, cursorPosition);
    const charBeforeCursor = textBeforeCursor[cursorPosition - 1];
    this.tagText = '';
    if (charBeforeCursor && !/\s/.test(charBeforeCursor)) {
      const atIndex = textBeforeCursor.lastIndexOf('@');
      if (atIndex !== -1) {
        const charAfterAt = textBeforeCursor[atIndex + 1];
        if (!charAfterAt?.match(/\s/)) {
          this.tagText = textBeforeCursor.slice(atIndex);
        }
      }
    }
  }


  getTextWithLineBreaks(input: HTMLElement): string {
    return input.innerHTML
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?p>/gi, '\n')
      .replace(/<\/?div>/gi, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/<[^>]+>/g, '');
  }


  setSelectionPosition(element: HTMLElement): number {
    return this.cursorPositionService.saveCursorPosition(element);
  }


  handleKeyDown(event: KeyboardEvent, element: HTMLDivElement) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const curRange = selection.getRangeAt(selection.rangeCount - 1);
      if (event.key === 'Enter' && !event.shiftKey) this.handleEnter(event, element);
    }
  }


  handleEnter(event: Event, element : HTMLDivElement) {
    event.preventDefault();
    this.saveMessage(element, this.addDocumentInput);
  }


  //#region add @ Button
  addTag(input: HTMLElement) {
    if (document.activeElement !== input) this.setFocusAtTextEnd(input);
    this.insertTag(input);
  }


  insertTag(input: HTMLElement) {
    const text = input.innerText;
    const cursorPosition = this.setSelectionPosition(input);
    const charBeforeCursor = text[cursorPosition - 1];
    if (!charBeforeCursor || charBeforeCursor.match(/\s/)) {
      this.insertAtCursor('@', input);
    } else {
      this.insertAtCursor(' @', input);
    }
    this.checkForTag(input);
  }


  setFocusAtTextEnd(input : HTMLElement) {
    input.focus();
    var range = document.createRange();
    range.selectNodeContents(input);
    range.collapse(false);
    var selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      this.cursorPositionService.setLastCursorPosition(input);
    }
  }


  insertAtCursor(text: string, input: HTMLElement) {
    const sel = window.getSelection();
    const range = this.cursorPositionService.restoreCursorPosition(input);  
    if (sel && range) {
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    this.setSelectionPosition(input);
  }


  //#region Utility XSS Prevention
  formatTagForSave(text: string) {
    const regex = new RegExp(/<app-profile-button[^>]*><button[^>]*data-user-id="([^"]+)"[^>]*>[^<]*<\/button><\/app-profile-button>/g);
    const formattedText = text.replace(regex, '@$1');
    return formattedText;
  }


  formatMessageForSave(text: string) {
    let formattedText = this.formatTagForSave(text);
    return formattedText;
  }

  
  async setFocusOnInput() {
    await this.channelInput.nativeElement.focus();
  }
}
