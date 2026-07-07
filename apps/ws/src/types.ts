export type OutgoingMessage = any

export interface UserAvatar {
    id: string;
    imageUrl: string;
    name: string;
}

export interface MessageSchema{
  id: string;
  groupId: string;
  senderId: string;
  message: string;
  createdAt: Date;
  edited: boolean;
  deleted: boolean;
}