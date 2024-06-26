import { ChangeDetectorRef, Component, ElementRef, Input, Renderer2 } from '@angular/core';
import { OpenProfileDirective } from '../directives/open-profile.directive';

@Component({
  selector: 'app-profile-button',
  standalone: true,
  imports: [OpenProfileDirective],
  templateUrl: './profile-button.component.html',
  styleUrl: './profile-button.component.scss'
})
export class ProfileButtonComponent {

  constructor(private el: ElementRef, private renderer: Renderer2, private cdRef: ChangeDetectorRef) { }

  @Input() userId!: string;
  @Input() userName!: string;

  ngOnInit(): void {
    this.renderer.setAttribute(this.el.nativeElement, 'contenteditable', 'false');
    this.renderer.addClass(this.el.nativeElement, 'tag');
    this.cdRef.detectChanges();
  }

}
