import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../firebase.service/user.service';
import { UserAuthService } from '../../firebase.service/user.auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-dialog-edit-profile',
  standalone: true,
  imports: [CommonModule, MatDialogModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dialog-edit-profile.component.html',
  styleUrl: './dialog-edit-profile.component.scss',
})
export class DialogEditProfileComponent implements OnInit {
  user: User | null = null;

  editForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
  });
  avatars = [
    'assets/img/avatar-1.jpg',
    'assets/img/avatar-2.jpg',
    'assets/img/avatar-3.jpg',
    'assets/img/avatar-4.jpg',
    'assets/img/avatar-5.jpg',
    'assets/img/avatar-6.jpg',
  ];
  emailExists: boolean = false;
  changeAvatar: boolean = false;
  thisAvatar: string = this.userService.currentUser?.profile_img;
  imageChanged: boolean = false;
  currentFile: any;


  constructor(
    public dialogRef: MatDialogRef<DialogEditProfileComponent>,
    public userService: UserService,
    public userAuth: UserAuthService,
    public router: Router,
    public profileService: ProfileService
  ) { }


  ngOnInit(): void {
    this.editForm.patchValue({
      name: this.userService.currentUser.name,
      email: this.userService.currentUser.email,
    });
  }


  emailPlaceholder(): string {
    return this.userService.currentUser?.email == this.userAuth.googleEmail
      ? 'Kann hier nicht bearbeitet werden'
      : this.userService.currentUser?.email;
  }


  

  isOwnProfile(): boolean {
    return this.profileService.getOwnProfileStatus();
  }


  openAvatarDialog() {
    this.changeAvatar = true;
  }


  closeAvatarDialog() {
    if (this.changeAvatar) {
      this.changeAvatar = false;
    }
  }


  async changeUserAvatar(i: number) {
    this.thisAvatar = this.avatars[i];
    this.currentFile = undefined;
    this.imageChanged = true;
    this.closeAvatarDialog();
  }


  
  async uploadAvatar(event: any) {
    const file = event.target.files[0];
    this.currentFile = file;
    this.thisAvatar = this.createURL(file);
    this.closeAvatarDialog();
    this.imageChanged = true;
  }


  createURL(file: File) {
    return URL.createObjectURL(file);
  }


  async onSubmit() {
    if (this.editForm.valid || this.imageChanged) {
      const displayName = this.editForm.get('name')?.value;
      const email = this.editForm.get('email')?.value;
      if(this.imageChanged) {
        if(this.currentFile) {
          const imgURL = await this.userService.uploadImage(this.currentFile);
          await this.userService.updateUserImage(this.userService.currentUser.id, imgURL);
          this.userService.currentUser.profile_img = imgURL;
        } else {
          await this.userService.updateUserImage(this.userService.currentUser.id, this.thisAvatar);
          this.userService.currentUser.profile_img = this.thisAvatar;
        }
      }
      
      if (displayName != this.userService.currentUser.name) {
        this.changeNameOnly(displayName);
      }
      if (email != this.userService.currentUser.email) {
        this.changeEmailOnly(email);
      }
      this.dialogRef.close();
    }
  }


  async changeNameOnly(displayName: any) {
    await this.userAuth.changeCurrentUser(displayName);
    this.userService.currentUser.name = displayName;
  }
  

  async changeEmailOnly(email: any) {
    const emailExists = await this.userAuth.emailExists(email);
    if (emailExists.includes(email)) {
      this.emailExists = true;
      return;
    }
    this.emailExists = false;
    await this.userAuth.changeCurrentUser(undefined, email);
  }


  changeFromGmail() {
    let string = '';
    string = this.userService.currentUser.email;
    return string.includes("gmail");
  }
}
