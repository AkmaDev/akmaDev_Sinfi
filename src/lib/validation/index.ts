import * as z from "zod";

// ============================================================
// USER
// ============================================================
export const SignupValidation = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const SigninValidation = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export const ProfileValidation = z.object({
  file: z.custom<File[]>(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email(),
  bio: z.string(),
  facebook: z.string().url().optional().or(z.literal('')).or(z.string().regex(/^www\..+/).transform(url => `https://${url}`)),        //Je suis passé ici 
  youtube: z.string().url().optional().or(z.literal('')).or(z.string().regex(/^www\..+/).transform(url => `https://${url}`)),    
  linkedin: z.string().url().optional().or(z.literal('')).or(z.string().regex(/^www\..+/).transform(url => `https://${url}`)),
  instagram: z.string().url().optional().or(z.literal('')).or(z.string().regex(/^www\..+/).transform(url => `https://${url}`)),
  tiktok: z.string().url().optional().or(z.literal('')).or(z.string().regex(/^www\..+/).transform(url => `https://${url}`)),
  websiteLink: z.string().url().optional().or(z.literal('')).or(z.string().regex(/^www\..+/).transform(url => `https://${url}`)),
  location: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
  videoFile: z.custom<File[]>().optional(),
});

// ============================================================
// POST
// ============================================================
export const PostValidation = z.object({
  caption: z.string().min(5, { message: "Minimum 5 characters." }).max(2200, { message: "Maximum 2,200 caracters" }),
  file: z.custom<File[]>(),
  location: z.string().min(1, { message: "This field is required" }).max(1000, { message: "Maximum 1000 characters." }),
  tags: z.string(),
});
