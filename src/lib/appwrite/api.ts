import { ID, Query } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from "@/types";


// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  try {
    const session = await account.createEmailSession(user.email, user.password);

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      "top",
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    //  Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}
// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  const hasVideoToUpdate = (user.videoFile ?? []).length > 0; // si vide renvoi tableau vide
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };
    let video = {
      videoUrl: user.videoUrl,
      videoId: user.videoId,
    };
    
    if (hasVideoToUpdate) {
      // Upload new video to appwrite storage
      const uploadedVideo = await uploadFile(user.videoFile![0]);
      if (!uploadedVideo) throw new Error("Échec du téléchargement de la vidéo");

       // Get new video url
      const videoUrl = getFilePreview(uploadedVideo.$id);
      if (!videoUrl) {
        await deleteFile(uploadedVideo.$id);
        throw new Error("Impossible de récupérer l'URL de la vidéo");
      }
      
      video = { ...video, videoUrl: videoUrl, videoId: uploadedVideo.$id };
    }

    // const file = user.file[0];
    // const fileType = file.type.split('/')[0]; 

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage

      // if (fileType === 'video') {
      // const uploadedVideo = await uploadFile(file);
      // if (!uploadedVideo) throw new Error("Échec du téléchargement de la vidéo");
      // const videoUrl = getFilePreview(uploadedVideo.$id);

      //   if (!videoUrl) {
      //     await deleteFile(uploadedVideo.$id);
      //     throw new Error("Impossible de récupérer l'URL de la vidéo");
      //   }

      //   video = { ...video, videoUrl: videoUrl, videoId: uploadedVideo.$id };
      // }else if (fileType === 'image') {
        const uploadedFile = await uploadFile(user.file[0]);
        if (!uploadedFile) throw new Error("Échec du téléchargement du fichier");
  
      //   // Get new file url
        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
               await deleteFile(uploadedFile.$id);
          throw new Error("Impossible de récupérer l'URL du fichier");
        }
  
        image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
      }
      //  }


    // Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        facebook: user.facebook,
        youtube: user.youtube,
        linkedin: user.linkedin,
        instagram: user.instagram,
        tiktok: user.tiktok,
        websiteLink: user.websiteLink,
        location: user.location,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        videoUrl: video.videoUrl,
        videoId: video.videoId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      console.error("Échec de la mise à jour de l'utilisateur.");
      // Delete new file that has been recently uploaded
      if ( hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      if (hasVideoToUpdate) {
        await deleteFile(video.videoId!);
      }
      throw new Error("Échec de la mise à jour de l'utilisateur");
    }


    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    if (user.videoId && hasVideoToUpdate) {
      await deleteFile(user.videoId);
    }

    return updatedUser;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    } else {
      console.log("Une erreur inattendue est survenue.");
    }
  }
}



export async function uploadVideo(file: File) {
  try {
    const uploadedVideo= await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedVideo.$id;
  } catch (error) {
    console.log(error);
  }
}

export const getVideoUrl = (videoId: string) => {
  return `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.storageId}/files/${videoId}/view?project=${appwriteConfig.projectId}`;
};


// Fonction pour calculer le hash d'un fichier
// async function calculateFileHash(file: File) {
//   const arrayBuffer = await file.arrayBuffer();
//   const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
//   const hashArray = Array.from(new Uint8Array(hashBuffer));
//   const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
//   return hashHex;
// }


// // Fonction pour vérifier et uploader si nécessaire
// export async function uploadVideoHash(file: File) {
//   const fileHash = await calculateFileHash(file);
//   const bucketId = appwriteConfig.storageId;

//   // Rechercher dans la base de données si le fichier existe
//   try {
//     const response = await databases.listDocuments(appwriteConfig.databaseId, appwriteConfig.filesHashesCollectionId, [
//       `hash=${fileHash}`
//     ]);

//     // Si un fichier avec le même hash existe, renvoie l'ID existant
//     if (response.total > 0) {
//       return response.documents[0].fileId;
//     }
//   } catch (error) {
//     console.error("Erreur lors de la vérification du fichier existant :", error);
//   }

//   // Si le fichier n'existe pas, uploader et enregistrer son ID et hash
//   try {
//     const uploadedFile = await storage.createFile(bucketId, ID.unique(), file);
//     await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.filesHashesCollectionId, ID.unique(), {
//       fileId: uploadedFile.$id,
//       hash: fileHash
//     });

//     return uploadedFile.$id;
//   } catch (error) {
//     console.error("Erreur lors de l'upload de la vidéo :", error);
//     return null;
//   }
// }

