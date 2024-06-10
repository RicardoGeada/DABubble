import {
  Component,
  ElementRef,
  Input,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChannelFirebaseService } from '../../firebase.service/channelFirebase.service';
import { UserService } from '../../firebase.service/user.service';
import { User } from '../../interfaces/user.interface';
import { Message } from '../../interfaces/message.interface';
import { MessageService } from '../../firebase.service/message.service';
import { CustomDialogService } from '../../services/custom-dialog.service';
import { DialogEmojiPickerComponent } from '../channel/dialog-emoji-picker/dialog-emoji-picker.component';
import { PopupSearchComponent } from '../../shared/popup-search/popup-search.component';
import { TagToComponentDirective } from '../../shared/directives/tag-to-component.directive';
import { CursorPositionService } from '../../services/cursor-position.service';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule, PopupSearchComponent, TagToComponentDirective],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
})
export class MessageInputComponent {
//   @ViewChild('channelInput') channelInput!: ElementRef;
//   @Input() usedIn: 'channel' | 'thread' = 'channel';


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
    public channelService: ChannelFirebaseService,
    public messageService: MessageService,
    public customDialogService: CustomDialogService,
    public cursorPositionService: CursorPositionService
  ) {}


  get channelInputElement(): ElementRef {
    return this.channelInput;
  }

  //#region save message

  async saveMessage(channelInput: HTMLDivElement, fileInput: HTMLInputElement) {
    if (this.messageInput != '' || this.currentFile != null || channelInput.innerHTML != '') {
      this.prepareMessageForSave(channelInput);
      this.emptyInput(channelInput);
      this.message.id = await this.messageService.addMessage(this.message);
      // thread message update
      if (this.usedIn == 'thread') this.updateThreadMessage();
      // upload currentFile
      if (this.currentFile != null) await this.uploadFile(fileInput);
    }
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
    this.messageService.updateMessage(this.message);
    this.removeFile(fileInput);
  }

  //#endregion save message

  

  //#region placeholder

  getDirectChannelUser() {
    let contact = this.channelService.currentChannel.members.find(
      (member) => member != this.currentUser.id
    );
    if (contact) return this.userService.getUser(contact);
    else return this.currentUser;
  }


  getTextareaPlaceholderText() {
    const channel = this.channelService.currentChannel;
    const channelType = channel.channel_type;
    const channelName = channel.name;
    const members = channel.members;
    if (channelType === 'main') return `Nachricht an #${channelName}`;
    if (channelType === 'direct') return `Nachricht an ${members[0] === members[1] || members.length === 1 ? 'dich' : this.getDirectChannelUser()?.name}`;
    if (channelType === 'thread') return 'Antworten...';
    return 'Starte eine neue Nachricht';
  }


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
  }

  //#endregion file add / remove


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

  //#endregion emoji


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
      if (curRange.commonAncestorContainer.nodeType == 3 && curRange.startOffset > 0) return; // we are in child selection. The characters of the text node is being deleted
      // if (event.key === 'Backspace') this.handleBackSpace(selection, element, event);
      if (event.key === 'Enter' && !event.shiftKey) this.handleEnter(event, element);
    }
  }


  // handleBackSpace(selection : Selection, element : HTMLDivElement, event: Event) {
  //   const range = document.createRange();
  //   if (selection.anchorNode && selection.anchorNode != element) { // selection is in character mode. expand it to the whole editable field
  //       range.selectNodeContents(element);
  //       range.setEndBefore(selection.anchorNode);
  //   } else if (selection.anchorOffset > 0) range.setEnd(element, selection.anchorOffset);
  //   else return; // reached the beginning of editable field
  //   range.setStart(element, range.endOffset);
  //   const previousNode = range.cloneContents().lastChild;
  //   if (previousNode && previousNode.nodeType == Node.ELEMENT_NODE) {
  //     const previousElement = previousNode as HTMLElement;
  //     if (previousElement.contentEditable === 'false') {  // This is some rich content, e.g. smiley. We should help the user to delete it.
  //       range.deleteContents();
  //       event.preventDefault();
  //     }
  //   }
  // }

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

  //#endregion add @ Button

  //#endregion

  //#region Utility XSS Prevention TODO: in Service

  // escapeHTML(text: string) {
  //   return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // }

  formatTagForSave(text: string) {
    const regex = new RegExp(/<app-profile-button[^>]*><button[^>]*ng-reflect-user-id="([^"]+)"[^>]*>[^<]*<\/button><\/app-profile-button>/g);
    const formattedText = text.replace(regex, '@$1');
    return formattedText;
  }

  formatMessageForSave(text: string) {
    let formattedText = this.formatTagForSave(text);
    return formattedText;
  }

  // formatMessageForRead(text: string) {
  //   let formattedText = this.escapeHTML(text);
  //   return formattedText;
  // }

  //#endregion

 

  async setFocusOnInput() {
    await this.channelInput.nativeElement.focus();
  }
}
