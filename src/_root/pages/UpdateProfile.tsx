import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Textarea, Input, Button } from "@/components/ui";
import { ProfileUploader, Loader } from "@/components/shared";

import { ProfileValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useUpdateUser } from "@/lib/react-query/queries";

import { useEffect } from "react";
import VideoUploader from "@/components/shared/VideoUploader";
import { uploadVideo } from "@/lib/appwrite/api";
import { appwriteConfig } from "@/lib/appwrite/config";

const UpdateProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, setUser } = useUserContext();
  const form = useForm<z.infer<typeof ProfileValidation>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      file: [],
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio || "",
      facebook: user.facebook || "",
      youtube: user.youtube || "",
      linkedin: user.linkedin || "",
      instagram: user.instagram || "",
      tiktok: user.tiktok || "",
      websiteLink: user.websiteLink || "",
      location: user.location || "",
      videoFile: [],
    },
  });

  // Queries
  const { data: currentUser } = useGetUserById(id || "");
  const { mutateAsync: updateUser, isLoading: isLoadingUpdate } =
    useUpdateUser();

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  // S'assurer que les valeurs du formulaire ne sont réinitialisées qu'avec les données de l'utilisateur lorsque ces données sont récupérées, et non à chaque rendu du composant. Cela permet de conserver les valeurs des champs qui n'ont pas été modifiés lors de la soumission.
  useEffect(() => {
    form.reset({
      file: [],
      name: currentUser.name,
      username: currentUser.username,
      email: currentUser.email,
      bio: currentUser.bio || "",
      facebook: currentUser.facebook || "",
      youtube: currentUser.youtube || "",
      linkedin: currentUser.linkedin || "",
      instagram: currentUser.instagram || "",
      tiktok: currentUser.tiktok || "",
      websiteLink: currentUser.websiteLink || "",
      location: currentUser.location || "",
      videoFile: currentUser.videoFile || [],
    });
  }, [currentUser, form]);
  // Handler
  const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
    let videoId;

    if (currentUser.videoId) {
      videoId = currentUser.videoId;
    } else if (value.videoFile && value.videoFile.length > 0) {
      videoId = await uploadVideo(value.videoFile[0]);
      if (!videoId) throw new Error("Échec du telechargement de la vidéo");
    }

    // const videoUrl = `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.storageId}/files/${currentUser.videoId}/view?project=${appwriteConfig.projectId}`;

    const updatedUser = await updateUser({
      userId: currentUser.$id,
      name: value.name,
      bio: value.bio,
      facebook: value.facebook, // Je suis passé ici
      youtube: value.youtube,
      linkedin: value.linkedin,
      instagram: value.instagram,
      tiktok: value.tiktok,
      websiteLink: value.websiteLink,
      location: value.location,
      file: value.file,
      videoFile: value.videoFile,
      imageUrl: currentUser.imageUrl,
      imageId: currentUser.imageId,
      videoId: videoId,
      videoUrl: `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.storageId}/files/${currentUser.videoId}/view?project=${appwriteConfig.projectId}`,
    });

    if (!updatedUser) {
      toast({
        title: `Echec de la mise à jour de l'utilisateur. Veuillez reessayer`,
      });
    }

    setUser({
      ...user,
      name: updatedUser?.name,
      bio: updatedUser?.bio,
      facebook: updatedUser?.facebook, // Je suis passé ici
      youtube: updatedUser?.youtube,
      linkedin: updatedUser?.linkedin,
      instagram: updatedUser?.instagram,
      tiktok: updatedUser?.tiktok,
      websiteLink: updatedUser?.websiteLink,
      location: updatedUser?.location,
      imageUrl: updatedUser?.imageUrl,
      videoUrl: `https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.storageId}/files/${currentUser.videoId}/view?project=${appwriteConfig.projectId}`,
    });
    return navigate(`/profile/${id}`);
  };

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">
            Modifier Profil
          </h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="flex flex-col gap-7 w-full mt-4 max-w-5xl">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className="flex">
                  <FormControl>
                    <ProfileUploader
                      fieldChange={field.onChange}
                      mediaUrl={currentUser.imageUrl}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Nom</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">
                    Nom Utilisateur/Entreprise
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="videoFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">
                    Ajouter une Video
                  </FormLabel>
                  <FormControl>
                    <VideoUploader
                      fieldChange={field.onChange}
                      mediaUrl={currentUser.videoUrl}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="shad-textarea custom-scrollbar"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">
                    {" "}
                    Localisation
                  </FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="websiteLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label"> Site Web</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="facebook"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">facebook</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="youtube"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Youtube</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">LinkedIn</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instagram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Instagram</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tiktok"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Tiktok</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 items-center justify-end">
              <Button
                type="button"
                className="shad-button_dark_4"
                onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-500 text-light-1 flex gap-2 whitespace-nowrap"
                disabled={isLoadingUpdate}>
                {isLoadingUpdate && <Loader />}
                Modifier Profil
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateProfile;
