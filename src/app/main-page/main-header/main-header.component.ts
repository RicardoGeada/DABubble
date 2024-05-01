import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { LogOutDialogComponent } from './log-out-dialog/log-out-dialog.component';
import { CustomDialogService } from '../../services/custom-dialog.service';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../firebase.service/user.service';
@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, MatCardModule, FormsModule],
  templateUrl: './main-header.component.html',
  styleUrl: './main-header.component.scss',
})
export class MainHeaderComponent implements OnInit{
  currentUser = null;

  constructor(private customDialogService: CustomDialogService, private userService: UserService) {}

  ngOnInit() {
    // this.userService.getCurrentUser("user@example.com"); // Beispieldaten oder dynamische Daten
    this.currentUser = this.userService.currentUser;
  }

  openLogOutDialog(button: HTMLElement) {
    const component = LogOutDialogComponent;
    this.customDialogService.openDialogAbsolute(button, component, 'right');
  }
}
