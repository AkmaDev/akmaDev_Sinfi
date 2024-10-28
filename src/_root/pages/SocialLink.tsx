// components/SocialLink.tsx

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faYoutube,
  faLinkedin,
  faTiktok, // Utilisez l'icône Globe pour le lien du site web
} from "@fortawesome/free-brands-svg-icons";

import { faGlobe } from "@fortawesome/free-solid-svg-icons";
interface SocialLinkProps {
  platform:
    | "Site Web"
    | "facebook"
    | "instagram"
    | "youtube"
    | "linkedin"
    | "tiktok";
  url?: string;
}

const icons: { [key in SocialLinkProps["platform"]]: React.ReactNode } = {
  "Site Web": <FontAwesomeIcon icon={faGlobe} className="h-5 w-5" />, // Icône pour le lien vers le site web
  facebook: <FontAwesomeIcon icon={faFacebook} className="h-5 w-5" />,
  instagram: <FontAwesomeIcon icon={faInstagram} className="h-5 w-5" />,
  youtube: <FontAwesomeIcon icon={faYoutube} className="h-5 w-5" />,
  linkedin: <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />,
  tiktok: <FontAwesomeIcon icon={faTiktok} className="h-5 w-5" />,
};

// Dictionnaire de couleurs adapté pour le mode sombre
const colorClasses: { [key in SocialLinkProps["platform"]]: string } = {
  "Site Web": " hover:bg-gray-700 text-white", // Couleurs pour le lien du site web
  facebook: " hover:bg-blue-700 text-white", // Facebook
  instagram: " hover:bg-[#ff7eb3] text-white", // Instagram
  youtube: " hover:bg-[#A50000] text-white", // YouTube
  linkedin: " hover:bg-blue-800 text-white", // LinkedIn
  tiktok: " hover:bg-[#00f2ea] text-white", // TikTok
};

const SocialLink: React.FC<SocialLinkProps> = ({ platform, url }) => {
  if (!url) return null; // Ne pas afficher si pas de lien

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex p-3 rounded-lg gap-3 transition duration-300 shadow-lg border border-white hover:border-black transform hover:scale-105 ${colorClasses[platform]}`}>
      {icons[platform]}
      <span className="font-semibold">
        {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </span>
    </a>
  );
};

export default SocialLink;
