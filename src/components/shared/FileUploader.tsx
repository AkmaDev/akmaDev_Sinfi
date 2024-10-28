import { useCallback, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";

import { Button } from "@/components/ui";
import { convertFileToUrl } from "@/lib/utils";

type VideoUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
};

const VideoUploader = ({ fieldChange, mediaUrl }: VideoUploaderProps) => {
  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFile(acceptedFiles);
      fieldChange(acceptedFiles);
      setFileUrl(convertFileToUrl(acceptedFiles[0]));
    },
    [fieldChange]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mkv", ".mov", ".avi"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer">
      <input {...getInputProps()} className="cursor-pointer" />

      {fileUrl ? (
        <>
          <div className="flex flex-1 justify-center w-full p-5 lg:p-10">
            <video src={fileUrl} controls className="file_uploader-img" />
          </div>
          <p className="file_uploader-label">Cliquer ou déposer la vidéo ici</p>
        </>
      ) : (
        <div className="file_uploader-box ">
          <img
            src="/assets/icons/file-upload.png"
            width={96}
            height={77}
            alt="file upload"
          />

          <h3 className="base-medium text-light-2 mb-2 mt-6">
            Déposer la vidéo ici
          </h3>
          <p className="text-light-4 small-regular mb-6">MP4, MKV, MOV, AVI</p>

          <Button type="button" className="shad-button_dark_4">
            Sélectionner depuis l'ordinateur
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
