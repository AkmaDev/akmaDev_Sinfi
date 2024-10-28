import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";

import { Button } from "@/components/ui";
import { LikedPosts } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById } from "@/lib/react-query/queries";
import { GridPostList, Loader } from "@/components/shared";
import SocialLink from "./SocialLink";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { appwriteConfig } from "@/lib/appwrite/config";

interface StabBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StabBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { pathname } = useLocation();

  const { data: currentUser } = useGetUserById(id || "");

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  // https://cloud.appwrite.io/v1/storage/buckets/670a4082001006310c18/files/671edd2c14fd21e5796e/view?project=6708d34900177a7cd21b&project=6708d34900177a7cd21b&mode=admin
  //  https://cloud.appwrite.io/v1/storage/buckets/670a4082001006310c18/files/671edd2c14fd21e5796e/preview?width=2000&height=2000&gravity=top&quality=100&project=6708d34900177a7cd21b
  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={
              currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"
            }
            alt={`Image de profile de ${currentUser.name}`}
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{currentUser.username}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={currentUser.posts.length} label="Produits" />
              <StatBlock value={20} label="Followers" />
              <StatBlock value={20} label="Following" />
            </div>

            {/* video */}
            <div className=" mt-8 w-full flex justify-center items-center">
              <video
                src={`https://cloud.appwrite.io/v1/storage/buckets/${appwriteConfig.storageId}/files/${currentUser.videoId}/view?project=${appwriteConfig.projectId}`}
                autoPlay
                controls
                className="video-player w-full  rounded-lg shadow-lg bg-gray-900"
                onError={(e) => {
                  console.error(
                    `Erreur de chargement de la vidéo ${currentUser.videoId}`,
                    e
                  );
                }}>
                Your browser does not support the video tag.
              </video>
            </div>

            {/* bio */}
            <div className="flex flex-col items-center">
              <p className="small-medium md:base-medium flex justify-center xl:text-left mt-7 max-w-screen-sm">
                {currentUser.bio}
              </p>

              {currentUser.location && (
                <div className="flex justify-center  xl:justify-start mt-4 ">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="mr-2 text-red-500 mt-0.5"
                  />
                  <p className="small-medium md:base-medium text-light-2 mr-6">
                    {currentUser.location}
                  </p>
                </div>
              )}
            </div>

            {/* Affichage des liens sociaux */}
            <div className="flex flex-col mt-4 gap-4">
              {currentUser.websiteLink && (
                <SocialLink platform="Site Web" url={currentUser.websiteLink} />
              )}
              {currentUser.facebook && (
                <SocialLink platform="facebook" url={currentUser.facebook} />
              )}
              {currentUser.instagram && (
                <SocialLink platform="instagram" url={currentUser.instagram} />
              )}
              {currentUser.youtube && (
                <SocialLink platform="youtube" url={currentUser.youtube} />
              )}
              {currentUser.linkedin && (
                <SocialLink platform="linkedin" url={currentUser.linkedin} />
              )}
              {currentUser.tiktok && (
                <SocialLink platform="tiktok" url={currentUser.tiktok} />
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <div className={`${user.id !== currentUser.$id && "hidden"}`}>
              <Link
                to={`/update-profile/${currentUser.$id}`}
                className={`h-12 bg-dark-4 px-5 text-light-1 flex-center gap-2 rounded-lg ${
                  user.id !== currentUser.$id && "hidden"
                }`}>
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={20}
                  height={20}
                />
                <p className="flex whitespace-nowrap small-medium">
                  Modifier Profile
                </p>
              </Link>
            </div>
            <div className={`${user.id === id && "hidden"}`}>
              <Button type="button" className="shad-button_primary px-8">
                Follow
              </Button>
            </div>
          </div>
        </div>
      </div>

      {currentUser.$id === user.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${
              pathname === `/profile/${id}` && "!bg-dark-3"
            }`}>
            <img
              src={"/assets/icons/posts.svg"}
              alt="posts"
              width={20}
              height={20}
            />
            Produits
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-lg ${
              pathname === `/profile/${id}/liked-posts` && "!bg-dark-3"
            }`}>
            <img
              src={"/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
            />
            Favoris
          </Link>
        </div>
      )}

      <Routes>
        <Route
          index
          element={<GridPostList posts={currentUser.posts} showUser={false} />}
        />
        {currentUser.$id === user.id && (
          <Route path="/liked-posts" element={<LikedPosts />} />
        )}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;
