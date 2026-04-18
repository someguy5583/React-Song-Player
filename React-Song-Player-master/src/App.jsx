import { useState, useEffect, useRef } from "react";
import "./App.css";

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function SingleSlider({
  value,
  setValue,
  isPlaying,
  accent,
  duration,
  audioRef,
}) {
  const min = 0;
  const trackMax = duration > 0 ? duration : 1;
  const percent = duration > 0 ? (value / duration) * 100 : 0;
  const scrubbingRef = useRef(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) return;

    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (scrubbingRef.current) return;
      setValue(Math.floor(audio.currentTime));
    };

    audio.addEventListener("timeupdate", updateTime);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
    };
  }, [isPlaying, setValue, audioRef]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.style.setProperty("--progress", `${percent}%`);
    }
  }, [percent]);

  const startScrub = () => {
    scrubbingRef.current = true;
    const endScrub = () => {
      scrubbingRef.current = false;
      window.removeEventListener("pointerup", endScrub);
      window.removeEventListener("pointercancel", endScrub);
    };
    window.addEventListener("pointerup", endScrub);
    window.addEventListener("pointercancel", endScrub);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-700">
        <span>{formatTime(value)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <input
        ref={sliderRef}
        type="range"
        min={min}
        max={trackMax}
        value={Math.min(value, trackMax)}
        disabled={duration <= 0}
        onPointerDown={startScrub}
        onChange={(e) => {
          const newTime = Number(e.target.value);
          setValue(newTime);
          if (audioRef.current) {
            audioRef.current.currentTime = newTime;
          }
        }}
        className="music-slider"
        style={{ "--accent": accent }}
      />
    </div>
  );
}

function App() {
  const [value, setValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [isShuffled, setisShuffled] = useState(false);

  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);
  let volumeIcon;

  const audioFiles = import.meta.glob("./assets/*.mp3", { eager: true });

  const audioRef = useRef(null);
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;
  const playlistLengthRef = useRef(0);

  const [duration, setDuration] = useState(0);
  const [currentSongNumber, setCurrentSongNumber] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateDuration = () => setDuration(Math.floor(audio.duration));
    audio.addEventListener("loadedmetadata", updateDuration);

    audio.load();

    if (isPlayingRef.current) {
      const p = audio.play();
      if (p !== undefined) p.catch(() => {});
    }

    return () => audio.removeEventListener("loadedmetadata", updateDuration);
  }, [currentSongNumber]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      const len = playlistLengthRef.current;
      if (len < 1) return;
      setCurrentSongNumber((prev) => (prev + 1) % len);
      setValue(0);
      setisShuffled(false);
    };

    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  function getAudioSrc(title) {
    const entry = Object.entries(audioFiles).find(([path]) =>
      path.includes(title),
    );
    return entry ? entry[1].default : null;
  }

  const songs = {
    song1: {
      accent: "bg-blue-500",
      accentText: "text-blue-500",
      accentLight: "#3b82f6",
      accentDark: "#8b5cf6",
      accentCSS: "#3b82f6",
      albumCover:
        "https://i.scdn.co/image/ab67616d0000b2732c78500833c22279f8bef841",
      title: "Blue",
      artist: "Yung Kai",
    },

    song2: {
      accent: "bg-amber-500",
      accentText: "text-amber-500",
      accentLight: "#fbbf24",
      accentDark: "#b45309",
      accentCSS: "#f59e0b",
      albumCover:
        "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/97/bb/3e/97bb3e8e-970a-ce96-ce09-25cd5c5f959e/663918564691.jpg/600x600bf-60.jpg",
      title: "Mona Lisa",
      artist: "lucasp007",
    },

    song3: {
      accent: "bg-yellow-800",
      accentText: "text-yellow-800",
      accentLight: "#a16207",
      accentDark: "#713f12",
      accentCSS: "#854d0e",
      albumCover:
        "https://i.scdn.co/image/ab67616d0000b273bd8021d17038ec66b7f99161",
      title: "I'd Rather Pretend",
      artist: "Bryant Barnes",
    },

    song4: {
      accent: "bg-orange-600",
      accentText: "text-orange-600",
      accentLight: "#f97316",
      accentDark: "#c2410c",
      accentCSS: "#ea580c",
      albumCover:
        "https://cdn-images.dzcdn.net/images/cover/44310c327169b1ca1958529ffdd37f38/0x1900-000000-80-0-0.jpg",
      title: "Notion",
      artist: "The Rare Ocassions",
    },

    song5: {
      accent: "bg-stone-400",
      accentText: "text-stone-400",
      accentLight: "#a8a29e",
      accentDark: "#78716c",
      accentCSS: "#ac9e8e",
      albumCover:
        "https://cdn-images.dzcdn.net/images/cover/fea07231e297ee0c926aad963fc333bd/500x500.jpg",
      title: "Babydoll",
      artist: "Dominic Fike",
    },
  };

  playlistLengthRef.current = Object.keys(songs).length;

  let currentSong = songs[`song${currentSongNumber + 1}`];

  const song = currentSong ? getAudioSrc(currentSong.title) : null;

  const lyricsFile = `${currentSong.artist} - ${currentSong.title}.lrc`;

  function queueOpen() {
    document.getElementById("queue").classList.remove("hidden");

    document.getElementById("app").classList.add("opacity-50");
  }

  function queueClose() {
    document.getElementById("queue").classList.add("hidden");

    document.getElementById("app").classList.remove("opacity-50");
  }

  function checkPlayOrPause() {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying((prev) => !prev);
  }

  function shuffle() {
    setisShuffled((prev) => !prev);
  }

  function showSlide() {
    setShowVolume(true);
  }

  function hideSlide() {
    setShowVolume(false);
  }

  function prevSong() {
    const totalSongs = Object.keys(songs).length;

    setCurrentSongNumber((prev) => (prev - 1 + totalSongs) % totalSongs);

    setValue(0);

    setisShuffled(false);
  }

  function nextSong() {
    const totalSongs = Object.keys(songs).length;

    setCurrentSongNumber((prev) => (prev + 1) % totalSongs);

    setValue(0);

    setisShuffled(false);
  }

  function mute() {
    setVolume((v) => (v === 0 ? 1 : 0));
  }

  function showLyrics() {
    // document.getElementById("lyrics").classList.remove("hidden");
  }

  function hideLyrics() {
    // document.getElementById("lyrics").classList.add("hidden");
  }

  if (volume === 0) {
    volumeIcon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
        />
      </svg>
    );
  } else if (volume < 0.5) {
    volumeIcon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
        />
      </svg>
    );
  } else {
    volumeIcon = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
        <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
      </svg>
    );
  }

  return (
    <>
      <div className="h-screen bg-gradient-to-tl from-blue-700 to-blue-400 flex justify-center items-center p-0 m-0">
        <div
          className="bg-neutral-50 h-183 w-100 rounded-4xl p-0 overflow-hidden"
          id="app"
        >
          <div className="nav flex items-center justify-between w-full bg-neutral-50 text-2xl font-[500] font-[Quicksand] p-7 shadow-md h-20 rounded-3xl">
            <div className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </div>

            <p className="text-xl leading-none">Now Playing</p>

            <button
              className="flex justify-center items-center hover:opacity-60"
              onClick={queueOpen}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
                />
              </svg>
            </button>
          </div>

          <div className="body w-full flex flex-col items-center px-15 mt-4">
            <div id="firstSong" className="flex flex-col items-center">
              <div className={`rounded-3xl w-76 h-76 mt-6 overflow-hidden`}>
                <img src={`${currentSong.albumCover}`} alt="Blue" />
              </div>
              <p
                className={`font-bold text-3xl ${currentSong.accentText} mt-3`}
              >
                {currentSong.title}
              </p>
              <p className={`text-sm ${currentSong.accentText}`}>
                {currentSong.artist}
              </p>
            </div>
          </div>

          <div className="audioControl w-full px-10 mt-4 mb-16">
            <div className="timeControl flex-col justify-center items-center">
              <div className="timeline w-full h-3 mt-3 border-none">
                <SingleSlider
                  value={value}
                  setValue={setValue}
                  isPlaying={isPlaying}
                  accent={currentSong.accentCSS}
                  duration={duration}
                  audioRef={audioRef}
                />
              </div>

              <div className="controlsContainer w-full flex items-center justify-center gap-9 p-10 mt-3">
                <button
                  className={`text-3xl hover:scale-110 cursor-pointer ${currentSong.accentText}`}
                  onClick={prevSong}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z"
                    />
                  </svg>
                </button>

                <button
                  className={`playPause w-25 h-25 ${currentSong.accent} rounded-full flex items-center justify-center text-white cursor-pointer relative hover:opacity-90`}
                  onClick={checkPlayOrPause}
                >
                  {/* Play */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.25"
                    stroke="currentColor"
                    className={`w-8 h-8 translate-x-0.5 absolute transition-all duration-300 ${
                      isPlaying ? "opacity-0 scale-75" : "opacity-100 scale-100"
                    }`}
                  >
                    <path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>

                  {/* Pause */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    strokeLinecap="round"
                    className={`w-9 h-9 absolute transition-all duration-300 ${
                      isPlaying ? "opacity-100 scale-100" : "opacity-0 scale-75"
                    }`}
                  >
                    <path d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                  </svg>
                </button>

                <button
                  className={`text-3xl hover:scale-110 cursor-pointer ${currentSong.accentText}`}
                  onClick={nextSong}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div
              className="bottomControl w-full h-13.5 mt-0.5 hover:-mt-8.5 rounded-t-xl flex justify-evenly items-center"
              style={{
                background: `linear-gradient(to right, ${currentSong.accentDark}, ${currentSong.accentLight})`,
              }}
              onMouseEnter={showLyrics}
              onMouseLeave={hideLyrics}
            >
              <div
                className="volume relative flex flex-col items-center"
                onMouseEnter={showSlide}
                onMouseLeave={hideSlide}
              >
                {/* Slider container */}
                <div
                  className={`volume-popup ${
                    showVolume ? "volume-open" : "volume-closed"
                  }`}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="volume-slider"
                    style={{
                      "--accent": currentSong.accentCSS,
                      "--volume": `${volume * 100}%`,
                    }}
                  />
                </div>

                {/* Volume icon */}
                <button
                  className="text-neutral-50 cursor-pointer z-10"
                  onClick={mute}
                >
                  {volumeIcon}
                </button>
              </div>
              <div className="song-container">
                <div className="song-text text-neutral-50">
                  {currentSong.title} - {currentSong.artist}
                </div>
              </div>
              <button className="cursor-pointer" onClick={shuffle}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`size-6 ${isShuffled ? "text-green-400 drop-shadow-green-300 drop-shadow-md" : "text-neutral-50"} hover:opacity-75`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          className="queue bg-neutral-50 h-183 w-90 rounded-4xl p-0 overflow-hidden -ml-90 z-1 shadow-black hidden flex flex-col justify-between"
          id="queue"
        >
          <div className="nav flex items-center justify-between w-full bg-neutral-50 text-2xl font-[600] font-[Raleway] p-7 shadow-lg h-20 rounded-3xl">
            <button
              className="flex justify-center items-center cursor-pointer"
              id="search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>

            <div className="searchbar overflow-hidden bg-red-500 h-full w-0 hidden"></div>

            <p className="text-xl leading-none font-[500]">Queue</p>

            <button
              className="flex justify-center items-center"
              onClick={queueClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={song || ""} />
    </>
  );
}

export default App;
