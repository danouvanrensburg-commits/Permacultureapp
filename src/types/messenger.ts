export interface MessengerParticipant {
  id: string;
  name: string;
  username: string;
  avatar: string;
  badge?: string;
  role?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface MessengerAttachment {
  url: string;
  name: string;
  type: 'image' | 'file';
  size?: string;
}

export interface MessengerMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  attachment?: MessengerAttachment;
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface MessengerThread {
  id: string;
  type: 'direct' | 'group';
  title: string;
  description?: string;
  avatar?: string;
  participants: MessengerParticipant[];
  unreadCount: number;
  lastMessage?: {
    text: string;
    senderName: string;
    createdAt: string;
    hasAttachment?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}
