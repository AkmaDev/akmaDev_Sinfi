export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
  facebook?: string; // Je suis passé ici
  youtube?: string; 
  linkedin?: string; 
  instagram?: string; 
  tiktok?: string;  
  websiteLink?: string; 
  location?: string;
  videoId?: string;
  videoUrl?: URL | string;
  videoFile?: File[];
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: URL;
  file: File[];
  location?: string;
  tags?: string;
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  facebook?: string;  // Je suis passé ici 
  youtube?: string; 
  linkedin?: string; 
  instagram?: string; 
  tiktok?: string;  
  websiteLink?: string;
  location?: string;
  videoUrl?: string;
  videoFile?: File[];
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};
