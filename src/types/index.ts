export type VoiceFilterType = 
  | 'clean'
  | 'robot'
  | 'deep-noir'
  | 'helium'
  | 'radio'
  | 'cosmic'
  | 'alien';

export interface PersonaProfile {
  id: string;
  name: string;
  handle: string;
  avatarSeed: string;
  filterType: VoiceFilterType;
  filterLabel: string;
  filterDescription: string;
  accentColor: string;
  iconName: string;
}

export interface Dilemma {
  id: string;
  title: string;
  description: string;
  category: string;
  stanceA: string;
  stanceB: string;
  argumentsCount: number;
  activeDebaters: number;
  sparkQuestion: string;
}

export interface AnonymousRating {
  voterHash: string;
  originality: number; // 1-10
  humor: number; // 1-10
  intellect: number; // 1-10
  personaMatch: number; // 1-10
  totalScore: number; // 1-10 average
  badgeReaction?: string;
  timestamp: string;
}

export interface DebateArgument {
  id: string;
  dilemmaId: string;
  authorPersona: PersonaProfile;
  side: 'A' | 'B';
  sideText: string;
  argumentText: string;
  audioUrl?: string;
  audioDuration?: number;
  timestamp: string;
  votes: {
    creativity: number;
    humor: number;
    persuasion: number;
  };
  ratings?: AnonymousRating[];
  averageScore?: number;
  badges?: Record<string, number>;
  hasVoted?: boolean;
  starRating?: number; // average stars (1-5)
  starCount?: number; // total number of star ratings
  userGivenStars?: number; // 1-5 if rated by current user
  creativeCrownVotes?: number; // count of users selecting this as "En Yaratıcı"
  isChosenAsMostCreativeByMe?: boolean;
}

export interface JudgeVerdict {
  winner: 'A' | 'B' | 'Berabere';
  verdictTitle: string;
  creativeCritique: string;
  scores: {
    sideA: { creativity: number; humor: number; persuasion: number };
    sideB: { creativity: number; humor: number; persuasion: number };
  };
}

export interface DejaVuChallenge {
  id: string;
  actionText: string;
  category: string;
  hint: string;
  icon: string;
  targetObject: string;
}

export interface DejaVuMatch {
  id: string;
  challenge: DejaVuChallenge;
  userImage: string;
  partnerImage: string;
  partnerName: string;
  partnerCity: string;
  userCity: string;
  syncScore: number;
  timestamp: string;
  story: string;
  icebreaker: string;
  messages: Array<{
    id: string;
    sender: 'user' | 'partner';
    text: string;
    time: string;
  }>;
}

export interface SoundReaction {
  id: string;
  label: string;
  icon: string;
  soundType: 'airhorn' | 'applause' | 'gasp' | 'rimshot' | 'bell';
}
