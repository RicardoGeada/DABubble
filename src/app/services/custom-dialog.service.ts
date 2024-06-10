import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ComponentType } from '@angular/cdk/portal';


interface DialogParams {
  button: HTMLElement;
  component: ComponentType<any>;
  position: 'left' | 'right' | 'mid';
  mobilePosition?: 'mid' | 'bottom';
  mobileButton?: HTMLElement;
  maxWidth: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomDialogService {
  dialogRef: MatDialogRef<any> | null = null;

  constructor(public dialog: MatDialog) {}


  public openDialog(component: ComponentType<any>): MatDialogRef<any> {
    return this.dialog.open(component, {
      panelClass: 'custom-dialog',
    });
  }


  isMobile() {
    return window.innerWidth <= 768;
  }


  public openDialogAbsolute({button, component, position, mobilePosition, mobileButton, maxWidth} : DialogParams) {
    let buttonUsed = this.isMobile() && mobileButton ? mobileButton : button;
    let positionAsJSON = this.getPosition(buttonUsed, position, mobilePosition);
    let panelClass = this.getPanelClass(position, mobilePosition);
    this.dialogRef = this.dialog.open(component, {
      panelClass: panelClass,
      position: positionAsJSON,
      width: '100%',
      maxWidth: maxWidth,
    });
    if (this.dialogRef) {
      window.addEventListener('resize', () =>
        this.updateDialogPosition(button, position, mobilePosition, mobileButton)
      );
    }
  }


  updateDialogPosition(button: HTMLElement, position: 'left' | 'right' | 'mid', 
    mobilePosition?: 'mid' | 'bottom', mobileButton?: HTMLElement,): void {
    if (this.dialogRef) {
      let buttonUsed = this.isMobile() && mobileButton ? mobileButton : button;
      let positionAsJSON = this.getPosition(buttonUsed, position, mobilePosition);
      this.dialogRef.updatePosition(positionAsJSON);
    }
  }


  getPosition(button: HTMLElement, position: 'left' | 'right' | 'mid', mobilePosition?: 'mid' | 'bottom') {
    if (this.isMobile() && mobilePosition) {
      return this.getMobilePosition(mobilePosition);
    } else {
      const rect = button.getBoundingClientRect();
      if (position == 'left') return {
        top: rect.bottom + 'px',
        left:  rect.left + 'px',
      };
      else if (position == 'right') return {
        top: rect.bottom + 'px',
        right:  (window.innerWidth - rect.right) + 'px',
      };
      else return {};
    }
  }


  getMobilePosition(mobilePosition: 'mid' | 'bottom') {
    switch (mobilePosition) {
      case 'mid':
        return {};
      case 'bottom':
        return { left: '0px', bottom: '0px' };
    }
  }
  

  getPanelClass(position: 'left' | 'right' | 'mid', mobilePosition?: 'mid' | 'bottom') {
    let pannelClass = '';
    switch (position) {
      case 'left': pannelClass = 'custom-dialog-anchorTopLeft';
      break;
      case 'right' : pannelClass = 'custom-dialog-anchorTopRight';
      break;
      case 'mid': pannelClass = 'custom-dialog';
      break;
      default : pannelClass = 'custom-dialog';
    }
    if (mobilePosition) pannelClass += '-mobile';
    return pannelClass;
  }
}
