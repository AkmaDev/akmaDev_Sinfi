const Test = () => {
  const videoDownloadUrl =
    "https://www.youtube.com/shorts/e3_ydoYMUFs?feature=share";

  return (
    <div>
      <h2>Video Player</h2>
      <video width="640" height="480" controls>
        <source src={videoDownloadUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Test;
