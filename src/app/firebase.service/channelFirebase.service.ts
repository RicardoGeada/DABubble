import { Injectable, inject } from '@angular/core';
import { Channel } from '../interfaces/channel.interface';
import {
  Firestore,
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  where,
  query,
  getDocs,
} from '@angular/fire/firestore';
import { ChannelTypeEnum } from '../shared/enums/channel-type.enum';
import { runTransaction } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class ChannelFirebaseService {
  firestore: Firestore = inject(Firestore);
  channels: Channel[] = [];
  currentChannel: Channel = {
    id: '',
    name: '',
    description: '',
    created_at: 0,
    creator: '', // 'user_id'
    members: [],
    active_members: [],
    channel_type: ChannelTypeEnum.new,
  };
  currentThread: Channel = {
    id: '',
    name: '',
    description: '',
    created_at: 0,
    creator: '',
    members: [],
    active_members: [],
    channel_type: ChannelTypeEnum.thread,
  };
  channel: Channel | undefined;

  unsubChannels: any;
  unsubCurrentChannel: any = function () { };
  unsubCurrentThread: any = function () { };

  constructor() { }


  async getChannelsForCurrentUser() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      let currentUser = await JSON.parse(storedUser);
      this.unsubChannels = this.subChannels(currentUser.id);
    }
  }


  getDirectChannelId(currentUser_id: string, dm_target_id: string): string {
    let directChannels = this.channels.filter(
      (channel) => channel.channel_type == 'direct'
    );
    this.channel = undefined;
    if (currentUser_id == dm_target_id) {
      this.channel = directChannels.find((channel) => channel.members[0] == channel.members[1] || channel.members.length == 1);
    } else {
      this.channel = directChannels.find((channel) =>
        channel.members.includes(dm_target_id)
      );
    }
    if (this.channel) return this.channel.id;
    else return '';
  }


  setCurrentChannel(channel_id: string) {
    let channel = this.channels.find((channel) => channel.id == channel_id);
    if (channel) this.currentChannel = channel;
  }


  async getCurrentChannel(channel_id: string) {
    return onSnapshot(this.getChannelRef(channel_id), (channel) => {
      const channelData = channel.data();
      if (!channelData) {
        return;
      }
      this.currentChannel = this.setChannel(channel.data(), channel.id);
    });
  }


  getCurrentThread(thread_id: string) {
    return onSnapshot(this.getChannelRef(thread_id), (channel) => {
      this.currentThread = this.setChannel(channel.data(), channel.id);
    });
  }


  ngOnDestroy(): void {
    if (this.unsubChannels === typeof function () { }) this.unsubChannels();
    this.unsubCurrentChannel();
  }


  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }


  getChannelRef(channel_id: string) {
    return doc(collection(this.firestore, 'channels'), channel_id);
  }


  setChannel(data: any, id: string): Channel {
    return {
      id: id || '',
      name: data.name || '',
      description: data.description || '',
      created_at: data.created_at || 0,
      creator: data.creator || '', // 'user_id'
      members: data.members || [],
      active_members: data.active_members || [],
      channel_type: data.channel_type || '',
    };
  }

  
  /* CREATE */
  async addChannel(channel: Channel): Promise<string> {
    let ref = this.getChannelsRef();
    const docRef = await addDoc(ref, channel);
    return docRef.id;
  }


  /* READ */
  subChannels(user_id: string) {
    const q = query(
      this.getChannelsRef(),
      where('members', 'array-contains', user_id)
    );
    return onSnapshot(q, (channels) => {
      this.channels = [];
      channels.forEach((channel) => {
        this.channels.push(this.setChannel(channel.data(), channel.id));
      });
    });
  }


  /* UPDATE */
  async updateChannel(channel: Channel) {
    if (channel.id) {
      let docRef = doc(this.getChannelsRef(), channel.id);
      await updateDoc(docRef, JSON.parse(JSON.stringify(channel)))
    }
  }


  async updateChannelMembers(channelId: string, newMemberIds: string[]): Promise<void> {
    const docRef = doc(this.getChannelsRef(), channelId);
    await runTransaction(this.firestore, async (transaction) => {
      const docSnapshot = await transaction.get(docRef);
      if (!docSnapshot.exists()) {
        throw new Error('Channel nicht gefunden'); // wird das gebraucht?
      }
      const currentChannel = docSnapshot.data();
      const updatedMemberIds = Array.from(
        new Set([currentChannel['creator'], ...newMemberIds])
      );
      transaction.update(docRef, { members: updatedMemberIds });
      currentChannel['members'] = updatedMemberIds;
    });
  }


  async removeUserFromChannel(channelId: string, userId: string) {
    if (!channelId) return;
    const docRef = doc(this.getChannelsRef(), channelId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const channelData = docSnap.data() as Channel;
      const newMembers = channelData.members.filter(memberId => memberId !== userId);
      channelData.members = newMembers;
      if (newMembers.length === 0) {
        this.deleteChannel(channelId);
      } else {
        await updateDoc(docRef, { members: newMembers })
      }
    }
  }


  async deleteChannel(channelId: string) {
    if (!channelId) return;
    const docRef = doc(this.getChannelsRef(), channelId);
    await deleteDoc(docRef);
    this.channels = this.channels.filter(channel => channel.id !== channelId);
  }


  async getAllChannels(): Promise<Channel[]> {
    const allChannelsQuery = query(this.getChannelsRef());
    return getDocs(allChannelsQuery)
      .then((querySnapshot) => {
        this.channels = [];
        querySnapshot.forEach((doc) => {
          const channel = this.setChannel(doc.data(), doc.id);
          this.channels.push(channel);
        });
        return this.channels;
      })
      .catch((error) => {
        return [];
      });
  }


  async createNewChannel(channel: Omit<Channel, 'channel_type'>): Promise<string> {
    const newChannel: Channel = {
      ...channel,
      channel_type: ChannelTypeEnum.new,
    };
    return this.addChannel(newChannel);
  }


  async openNewChannel(currentUserId: string) {
    const channelFound = this.channels.find(channel => channel.members.includes(currentUserId) && channel.channel_type === 'main');
    if (channelFound) {
      this.setCurrentChannel(channelFound.id);
    }
  }
}
