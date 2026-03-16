export interface Member {
  id: string;
  name: string;
  bio: string;
  model: string;
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  createdAt: string;
}

export interface ClubWithMembers extends Club {
  members: Member[];
}

export type CreateMemberInput = Omit<Member, 'id' | 'createdAt'>;
export type CreateClubInput = Omit<Club, 'id' | 'createdAt'>;
