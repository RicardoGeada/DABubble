import { Injectable, inject } from '@angular/core';
import { Firestore, collection, onSnapshot, addDoc, doc, updateDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Reaction } from '../interfaces/reaction.interface';


@Injectable({
    providedIn: 'root'
})

export class ReactionService {
    firestore: Firestore = inject(Firestore);

    constructor() {  }

    // References
    getReactionsRef() {
        return collection(this.firestore, 'reactions');
    }


    setReaction(data: any, id: string) : Reaction {
        return {
            id: id || '',
            message_id: data.message_id || '',
            users: data.users || [],
            unicode: data.unicode || '',
            created_at: data.created_at || 0,
            lastTimeUsed: data.lastTimeUsed || 0,
        }
    }


    // CREATE
    async addReaction(reaction : Reaction) {
        let ref = this.getReactionsRef();
        const docRef = await addDoc(ref, reaction);
        return docRef.id;
    }


    // READ
    subReactionsForMessage(message_id : string) {
        const q = query(this.getReactionsRef(), where('message_id', '==', message_id), orderBy('created_at'));
        let reactionsArray : Reaction[] = [];
        const snapshot =  onSnapshot(q, (reactions) => {
            reactionsArray.length = 0;
            reactions.forEach((reaction) => {
                reactionsArray.push(this.setReaction(reaction.data(), reaction.id));
            })
        });
        return {snapshot, reactionsArray};
    }


    // UPDATE
    async updateReaction(reaction : Reaction) {
        if (reaction.id) {
          let docRef = doc(this.getReactionsRef(), reaction.id);
          await updateDoc(docRef, JSON.parse(JSON.stringify(reaction)))
        }
      }
}