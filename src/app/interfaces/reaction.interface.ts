export interface Reaction {
    id: string,
    message_id: string,
    unicode: string, 
    users: string[],
    created_at: number;
    lastTimeUsed: number;
}