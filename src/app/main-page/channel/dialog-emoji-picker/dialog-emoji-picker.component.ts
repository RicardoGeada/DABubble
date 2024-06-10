import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-dialog-emoji-picker',
  standalone: true,
  imports: [PickerComponent, MatDialogModule],
  templateUrl: './dialog-emoji-picker.component.html',
  styleUrl: './dialog-emoji-picker.component.scss'
})
export class DialogEmojiPickerComponent {

  constructor(public dialogRef: MatDialogRef<DialogEmojiPickerComponent>) { }

  addEmoji(event : any) {
    const emoji = event.emoji.native;
    this.dialogRef.close(emoji);
  }
}
