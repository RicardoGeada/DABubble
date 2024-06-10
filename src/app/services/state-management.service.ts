import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class StateManagementService {
  private selectedChannelId = new BehaviorSubject<string | null>(null);
  private selectedUserId = new BehaviorSubject<string | null>(null);

  setSelectedChannelId(id: string) {
    this.selectedChannelId.next(id);
    this.selectedUserId.next(null); 
  }


  setSelectedUserId(id: string) {
    this.selectedUserId.next(id);
    this.selectedChannelId.next(null);
  }


  getSelectedChannelId() {
    return this.selectedChannelId.asObservable();
  }
  

  getSelectedUserId() {
    return this.selectedUserId.asObservable();
  }
}
