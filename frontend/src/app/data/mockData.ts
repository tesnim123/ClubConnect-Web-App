export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: 'member' | 'staff' | 'vicepresident' | 'president' | 'admin';
  clubId?: string;
  clubName?: string;
  joinDate: string;
  status: 'pending' | 'active' | 'rejected';
  online?: boolean;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  logo: string;
  coverPhoto: string;
  memberCount: number;
  staffCount: number;
  status: 'active' | 'inactive';
  foundingDate: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'intra-club' | 'inter-club';
  clubId: string;
  clubName: string;
  clubLogo: string;
  coverPhoto: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  room?: string;
  maxCapacity: number;
  participantCount: number;
  status: 'open' | 'full' | 'pending' | 'approved' | 'rejected';
  rsvpDeadline: string;
  equipment: string[];
  attachments: FileAttachment[];
  organizer: string;
  submittedBy?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'ppt' | 'image' | 'link';
  url: string;
  size?: string;
  thumbnail?: string;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  attachments?: FileAttachment[];
  reactions?: { emoji: string; count: number }[];
  read?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  type: 'general' | 'staff' | 'announcement';
  clubId?: string;
  description: string;
  icon: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  members: string[];
  isPrivate: boolean;
}

export interface ForumPost {
  id: string;
  forumId: string;
  clubId?: string;
  clubName?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  body: string;
  tags: string[];
  reactions: number;
  commentCount: number;
  timestamp: string;
  isPinned?: boolean;
  attachments?: FileAttachment[];
}

export interface Notification {
  id: string;
  type: 'event' | 'rsvp' | 'forum' | 'message' | 'membership' | 'approval';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  icon: string;
}

// Mock data
export const currentUser: User = {
  id: '1',
  firstName: 'Marie',
  lastName: 'Dubois',
  email: 'marie.dubois@university.edu',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
  role: 'member',
  clubId: '1',
  clubName: 'Club Robotique',
  joinDate: '2024-09-15',
  status: 'active',
  online: true,
};

export const clubs: Club[] = [
  {
    id: '1',
    name: 'Club Robotique',
    description: 'Passion pour la robotique et l\'innovation technologique',
    category: 'Technologie',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=robot',
    coverPhoto: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    memberCount: 45,
    staffCount: 5,
    status: 'active',
    foundingDate: '2020-09-01',
  },
  {
    id: '2',
    name: 'Club Théâtre',
    description: 'Expression artistique et performances théâtrales',
    category: 'Arts',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=theater',
    coverPhoto: 'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800',
    memberCount: 32,
    staffCount: 4,
    status: 'active',
    foundingDate: '2019-10-15',
  },
  {
    id: '3',
    name: 'Club Débat',
    description: 'Développer l\'art de l\'argumentation et de la rhétorique',
    category: 'Académique',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=debate',
    coverPhoto: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    memberCount: 28,
    staffCount: 3,
    status: 'active',
    foundingDate: '2021-01-20',
  },
  {
    id: '4',
    name: 'Club Photographie',
    description: 'Capturer et partager la beauté du monde',
    category: 'Arts',
    logo: 'https://api.dicebear.com/7.x/shapes/svg?seed=photo',
    coverPhoto: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800',
    memberCount: 52,
    staffCount: 4,
    status: 'active',
    foundingDate: '2020-02-10',
  },
];

export const events: Event[] = [
  {
    id: '1',
    title: 'Compétition de Robots',
    description: 'Compétition annuelle de robotique entre les clubs universitaires',
    type: 'intra-club',
    clubId: '1',
    clubName: 'Club Robotique',
    clubLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=robot',
    coverPhoto: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
    date: '2026-04-15',
    time: '14:00',
    duration: '4 heures',
    location: 'Salle de conférences A',
    room: 'Conf-A',
    maxCapacity: 100,
    participantCount: 45,
    status: 'open',
    rsvpDeadline: '2026-04-10',
    equipment: ['Projecteur', 'Tables', 'Chaises', 'Microphone'],
    attachments: [
      {
        id: 'a1',
        name: 'Programme-Competition.pdf',
        type: 'pdf',
        url: '#',
        size: '2.4 MB',
      },
    ],
    organizer: 'Jean Martin',
  },
  {
    id: '2',
    title: 'Atelier Arduino Débutants',
    description: 'Initiation à la programmation Arduino pour débutants',
    type: 'intra-club',
    clubId: '1',
    clubName: 'Club Robotique',
    clubLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=robot',
    coverPhoto: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800',
    date: '2026-03-28',
    time: '10:00',
    duration: '2 heures',
    location: 'Laboratoire informatique',
    maxCapacity: 20,
    participantCount: 18,
    status: 'open',
    rsvpDeadline: '2026-03-26',
    equipment: ['Ordinateurs', 'Kits Arduino'],
    attachments: [],
    organizer: 'Sophie Laurent',
  },
  {
    id: '3',
    title: 'Soirée Théâtre Inter-Clubs',
    description: 'Spectacle ouvert à tous les clubs de l\'université',
    type: 'inter-club',
    clubId: '2',
    clubName: 'Club Théâtre',
    clubLogo: 'https://api.dicebear.com/7.x/shapes/svg?seed=theater',
    coverPhoto: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800',
    date: '2026-04-05',
    time: '19:00',
    duration: '3 heures',
    location: 'Amphithéâtre principal',
    maxCapacity: 200,
    participantCount: 156,
    status: 'open',
    rsvpDeadline: '2026-04-01',
    equipment: ['Éclairage', 'Sonorisation', 'Scène'],
    attachments: [],
    organizer: 'Claire Dubois',
  },
];

export const channels: Channel[] = [
  {
    id: '1',
    name: 'robotique-général',
    type: 'general',
    clubId: '1',
    description: 'Canal principal du Club Robotique',
    icon: '#',
    unreadCount: 3,
    lastMessage: 'Quelqu\'un a les plans pour le robot ?',
    lastMessageTime: '14:32',
    members: ['1', '2', '3'],
    isPrivate: false,
  },
  {
    id: '2',
    name: 'robotique-staff',
    type: 'staff',
    clubId: '1',
    description: 'Canal réservé au staff',
    icon: 'lock',
    unreadCount: 0,
    lastMessage: 'Réunion demain à 16h',
    lastMessageTime: '12:15',
    members: ['1', '2'],
    isPrivate: true,
  },
  {
    id: '3',
    name: 'tous-les-staffs',
    type: 'staff',
    description: 'Canal inter-clubs pour tous les staffs',
    icon: 'users',
    unreadCount: 5,
    lastMessage: 'Événement inter-clubs en préparation',
    lastMessageTime: '09:45',
    members: ['1', '2', '4', '5'],
    isPrivate: true,
  },
];

export const messages: Message[] = [
  {
    id: '1',
    channelId: '1',
    senderId: '2',
    senderName: 'Thomas Bernard',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas',
    content: 'Bonjour à tous ! N\'oubliez pas la réunion de demain.',
    timestamp: '2026-03-24T10:30:00',
    reactions: [{ emoji: '👍', count: 3 }],
    read: true,
  },
  {
    id: '2',
    channelId: '1',
    senderId: '1',
    senderName: 'Marie Dubois',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
    content: 'Merci pour le rappel ! J\'ai hâte de discuter du nouveau projet.',
    timestamp: '2026-03-24T10:35:00',
    read: true,
  },
  {
    id: '3',
    channelId: '1',
    senderId: '3',
    senderName: 'Lucas Martin',
    senderAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
    content: 'Quelqu\'un a les plans pour le robot ?',
    timestamp: '2026-03-24T14:32:00',
    attachments: [
      {
        id: 'f1',
        name: 'schema-robot.pdf',
        type: 'pdf',
        url: '#',
        size: '1.2 MB',
      },
    ],
    read: false,
  },
];

export const forumPosts: ForumPost[] = [
  {
    id: '1',
    forumId: '1',
    clubId: '1',
    clubName: 'Club Robotique',
    authorId: '1',
    authorName: 'Marie Dubois',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
    title: 'Idées pour le prochain projet de groupe',
    body: 'Bonjour à tous ! Je propose qu\'on travaille sur un robot autonome capable de naviguer dans un labyrinthe. Qu\'en pensez-vous ?',
    tags: ['Projet', 'Robotique', 'Groupe'],
    reactions: 12,
    commentCount: 8,
    timestamp: '2026-03-20T16:00:00',
    isPinned: true,
  },
  {
    id: '2',
    forumId: '1',
    clubId: '1',
    clubName: 'Club Robotique',
    authorId: '2',
    authorName: 'Thomas Bernard',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas',
    title: 'Ressources Arduino pour débutants',
    body: 'Voici une liste de ressources utiles pour ceux qui débutent avec Arduino...',
    tags: ['Ressources', 'Arduino', 'Débutant'],
    reactions: 18,
    commentCount: 5,
    timestamp: '2026-03-18T09:30:00',
    attachments: [
      {
        id: 'fp1',
        name: 'Guide-Arduino.pdf',
        type: 'pdf',
        url: '#',
        size: '3.5 MB',
      },
    ],
  },
];

export const notifications: Notification[] = [
  {
    id: '1',
    type: 'event',
    title: 'Rappel d\'événement',
    description: 'La Compétition de Robots commence dans 2 jours',
    timestamp: '2026-03-24T08:00:00',
    read: false,
    icon: 'calendar',
  },
  {
    id: '2',
    type: 'membership',
    title: 'Demande acceptée',
    description: 'Votre adhésion au Club Robotique a été approuvée',
    timestamp: '2026-03-23T15:30:00',
    read: true,
    icon: 'check-circle',
  },
  {
    id: '3',
    type: 'forum',
    title: 'Nouveau commentaire',
    description: 'Thomas a commenté votre post "Idées pour le prochain projet"',
    timestamp: '2026-03-22T11:45:00',
    read: true,
    icon: 'message-circle',
  },
];

export const members: User[] = [
  {
    id: '1',
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@university.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
    role: 'president',
    clubId: '1',
    clubName: 'Club Robotique',
    joinDate: '2024-09-15',
    status: 'active',
    online: true,
  },
  {
    id: '2',
    firstName: 'Thomas',
    lastName: 'Bernard',
    email: 'thomas.bernard@university.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas',
    role: 'vicepresident',
    clubId: '1',
    clubName: 'Club Robotique',
    joinDate: '2024-09-20',
    status: 'active',
    online: true,
  },
  {
    id: '3',
    firstName: 'Lucas',
    lastName: 'Martin',
    email: 'lucas.martin@university.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas',
    role: 'staff',
    clubId: '1',
    clubName: 'Club Robotique',
    joinDate: '2024-10-05',
    status: 'active',
    online: false,
  },
  {
    id: '4',
    firstName: 'Emma',
    lastName: 'Rousseau',
    email: 'emma.rousseau@university.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    role: 'member',
    clubId: '1',
    clubName: 'Club Robotique',
    joinDate: '2024-11-12',
    status: 'active',
    online: true,
  },
  {
    id: '5',
    firstName: 'Noah',
    lastName: 'Lefevre',
    email: 'noah.lefevre@university.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah',
    role: 'member',
    clubId: '1',
    clubName: 'Club Robotique',
    joinDate: '2025-01-08',
    status: 'pending',
    online: false,
  },
];
