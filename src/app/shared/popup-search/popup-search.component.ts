import {
  Component,
  ComponentRef,
  ElementRef,
  Input,
  Renderer2,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';
import { Channel } from '../../interfaces/channel.interface';
import { SearchService } from '../../services/search.service';
import { UserService } from '../../firebase.service/user.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThreadService } from '../../services/thread.service';
import { ChannelTypeEnum } from '../enums/channel-type.enum';
import { ChannelService } from '../../firebase.service/channel.service';
import { User } from '../../interfaces/user.interface';
import { ProfileButtonComponent } from '../profile-button/profile-button.component';
import { CursorPositionService } from '../../services/cursor-position.service';

@Component({
  selector: 'app-popup-search',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './popup-search.component.html',
  styleUrl: './popup-search.component.scss',
})
export class PopupSearchComponent {

  filteredUsers: User[] = [];
  filteredChannels: Channel[] = [];
  selectedUserId: string = '';

  @Input() searchTerm: string = '';
  @Input() inputElement!: ElementRef;
  @Input() viewContainerRef!: ViewContainerRef;


  constructor(
    public searchService: SearchService,
    public userService: UserService,
    public threadService: ThreadService,
    public channelService: ChannelService,
    private renderer: Renderer2,
    public cursorPositionService: CursorPositionService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchTerm']) this.filter(this.searchTerm);
  }

  ngOnDestroy(): void { }


  filter(searchTerm: string): void {
    if (searchTerm.startsWith('@')) {
      this.filteredUsers = this.searchService.filterUsersByPrefix(searchTerm, this.userService.allUsers);
      this.filteredChannels = [];
    } else if (searchTerm.startsWith('#')) {
      this.filteredChannels = this.searchService.filterChannelsByTypeAndPrefix(searchTerm, ChannelTypeEnum.main);
      this.filteredUsers = [];
    } else {
      const results = this.searchService.clearFilters();
      this.filteredUsers = results.users;
      this.filteredChannels = results.channels;
    }
  }


  addProfileButton(user: User, event: Event) {
    event.preventDefault();
    let container = this.inputElement.nativeElement;
    let range = this.cursorPositionService.restoreCursorPosition(container);
    if (range) {
      this.handleRange(user, range, container);
      // service userselected
      this.searchService.userSelected();
    }
  }

  
  handleRange(user: User, range: Range, container: HTMLElement) {
    range = this.extendRangeToSearchTerm(range, this.searchTerm);
    this.replaceRangeWithHTML(range, `<span class="dynamic-user" data-userid="${user.id}">${user.name}</span>`);
    this.handleDynamicUserElements(container, range);
    this.searchTerm = '';
  }
  

  handleDynamicUserElements(container: HTMLElement, range: Range) {
    const dynamicUserElements = container.querySelectorAll('.dynamic-user');
    dynamicUserElements.forEach((element: Element) => {
      const htmlElement = element as HTMLElement;
      this.createAndInsertProfileButton(htmlElement, container, range);
    });
  }
  

  createAndInsertProfileButton(element: HTMLElement, container: HTMLElement, range: Range) {
    const userId = element.getAttribute('data-userid');
    const userName = element.innerText;
    const componentRef: ComponentRef<ProfileButtonComponent> = this.viewContainerRef.createComponent(ProfileButtonComponent);
    componentRef.instance.userId = userId!;
    componentRef.instance.userName = userName;
    range.setStartAfter(element); 
    this.renderer.insertBefore(container, componentRef.location.nativeElement, element);
    this.renderer.removeChild(container, element);
  }


  extendRangeToSearchTerm(range: Range, searchTerm: string) {
    const { startContainer, startOffset } = range;
    const inputLength = searchTerm.length;
    let { currentNode, newStartOffset } = this.getNewStartOffset(startContainer, startOffset, inputLength);
    this.setRangeStartAndEnd(range, currentNode, newStartOffset, startOffset, inputLength);
    return range;
  }

  
  getNewStartOffset(startContainer: Node, startOffset: number, inputLength: number) {
    let currentNode = startContainer;
    let newStartOffset = startOffset;
    while (newStartOffset < inputLength && currentNode.previousSibling) {
      currentNode = currentNode.previousSibling;
      newStartOffset = this.calculateNewStartOffset(currentNode, newStartOffset);
    }
    return { currentNode, newStartOffset };
  }
  

  calculateNewStartOffset(currentNode: Node, newStartOffset: number) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      newStartOffset += currentNode.textContent!.length;
    } else if (currentNode.nodeType === Node.ELEMENT_NODE && currentNode.nodeName === 'BR') {
      newStartOffset++;
    }
    return newStartOffset;
  }
  

  setRangeStartAndEnd(range: Range, currentNode: Node, newStartOffset: number, startOffset: number, inputLength: number) {
    range.setStart(currentNode, Math.max(0, startOffset - inputLength));
    range.setEnd(currentNode, startOffset);
  }


  replaceRangeWithHTML(range: Range, newHTML: string) {
    const fragment = this.createFragmentFromHTML(newHTML);
    this.insertFragmentIntoRange(range, fragment);
  }
  

  createFragmentFromHTML(newHTML: string): DocumentFragment {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newHTML;
    const fragment = document.createDocumentFragment();
    let child;
    while ((child = tempDiv.firstChild)) {
      fragment.appendChild(child);
    }
    return fragment;
  }
  

  insertFragmentIntoRange(range: Range, fragment: DocumentFragment) {
    const startContainer = range.startContainer;
    if (startContainer.nodeType === Node.TEXT_NODE) {
      range.deleteContents();
      range.insertNode(fragment);
    } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
      this.insertFragmentIntoElement(range, fragment, startContainer as HTMLElement);
    }
  }
  

  insertFragmentIntoElement(range: Range, fragment: DocumentFragment, element: HTMLElement) {
    const offset = range.startOffset;
    const childNodes = element.childNodes;
    if (offset < childNodes.length) {
      element.insertBefore(fragment, childNodes[offset]);
    } else {
      element.appendChild(fragment);
    }
  }

}
