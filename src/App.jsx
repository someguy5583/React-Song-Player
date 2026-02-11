import { useState, useEffect } from 'react'
import './App.css'


function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}


function SingleSlider({ value, setValue, isPlaying }) {
  const min = 0
  const max = 142
  
  useEffect(() => {
    if (!isPlaying) return
    
    const interval = setInterval(() => {
      setValue((pdrev) => {
        return prev < max ? prev + 1 : 0
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isPlaying, setValue, max])
  
  return (
    <div className="w-full">
      <div className="flex justify-between">
        <span>{formatTime(value)}</span>
        <span>{formatTime(max)}</span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full"
        // className="w-full"
        />
    </div>

)
}

function App() {
  const [value, setValue] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const [accent, setAccent] = useState("bg-blue-500")
  const [textAccent, setTextAccent] = useState("text-blue-500")
  const [timelineAccent, setTimelineAccent] = useState("accent-blue-500")
  
  function queueOpen() {
    document.getElementById("queue").classList.remove("hidden")

    document.getElementById("app").classList.add("opacity-60")
  }
  
  function queueClose() {
    document.getElementById("queue").classList.add("hidden")

    document.getElementById("app").classList.remove("opacity-60")
  }

  function checkPlayOrPause() {
    setIsPlaying((prev) => !prev)
    console.log(isPlaying ? 'pause' : 'play', 'at', value)
  }

  return (
    <>
      <div className="h-screen bg-gradient-to-tl from-blue-700 to-blue-400 flex justify-center items-center p-0 m-0">


        <div className="bg-neutral-100 h-183 w-100 rounded-4xl p-0 overflow-hidden" id="app">
          <div className="nav flex items-center justify-between w-full bg-neutral-100 text-2xl font-[600] font-[Raleway] p-7 shadow-lg h-20">
            <div className="flex items-center justify-center">
              <ion-icon name="chevron-back-outline"></ion-icon>
            </div>
            
            <p className="text-xl leading-none">Now Playing</p>
            
            <button className="flex justify-center items-center hover:opacity-70 transition-opacity" onClick={queueOpen}>
              <ion-icon name="list-outline"></ion-icon>
            </button>
          </div>

          <div className="body w-full h-105 items-center justify-center flex flex-col px-15 -mt-3">
            <div id="firstSong" className="flex flex-col items-center">
              {/* 2. Use template literals to inject the variable */}
              <div className={`rounded-3xl w-55 h-55 ${accent} mb-5`} />
              <p className={`font-bold text-4xl ${textAccent} mt-3`}>Blue</p>
              <p className={`text-xl ${textAccent} mt-2`}>Yung Kai</p>
            </div>
          </div>

          <div className="audioControl h-full w-full px-10 -mt-5">
            <div className="timeControl flex-col justify-center items-center">
              <div className="timeline w-full h-3 mt-2">
                <SingleSlider
                  value={value}
                  setValue={setValue}
                  isPlaying={isPlaying}
                />
              </div>

              <div className="controlsContainer w-full flex items-center justify-center p-10 mt-3">
                <button
                  className={`playPause w-25 h-25 ${accent} rounded-full flex items-center justify-center text-3xl text-white`}
                  onClick={checkPlayOrPause}
                >
                  <ion-icon name={isPlaying ? 'pause' : 'play'}></ion-icon>
                </button>
              </div>
            </div>
            <div className="w-full flex justify-center">
              <div className="w-40 h-2 bg-neutral-700 rounded-full mt-6"></div>
            </div>
          </div>
        </div>

        <div className="queue bg-neutral-100 h-183 w-90 rounded-4xl p-0 overflow-hidden -ml-90 z-1 shadow-black hidden flex flex-col justify-between" id="queue">
          <div className="nav flex items-center justify-between w-full bg-neutral-100 text-2xl font-[600] font-[Raleway] p-7 shadow-lg h-20">
            <button className="flex justify-center items-center">
              <ion-icon name="search-outline"></ion-icon>
            </button>
            
            <p className="text-xl leading-none">Queue</p>
            
            <button className="flex justify-center items-center" onClick={queueClose}>
              <ion-icon name="chevron-forward-outline"></ion-icon>
            </button>
          </div>

          <div className="w-full flex justify-center">
              <div className="w-40 h-2 bg-neutral-700 rounded-full mb-5 -ml-10"></div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
