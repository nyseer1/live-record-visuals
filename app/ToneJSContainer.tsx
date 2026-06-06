"use client";
import { useState } from "react";
import * as Tone from "tone";
import CanvasCursor from "./components/cursors/CanvasCursor";
import RecordMotion from "./components/recordMotion";

export default function ToneJSContainer() {
  const [isTonejsOn, setIsTonejsOn] = useState(false);

  //TODO useRef to store data that is not needed for render (like a sequence array)
  
  
  async function handleStartTonejs() {
    //async function means run this function asynchronously so other code can be executed during loading

    try {
      // wait for audio context to start before playing audio
      await Tone.start(); //await says wait here until this calculation is done
    } catch (error) {
      // only runs in the browser where the window object and AudioContext are available
      console.error("web audio api not supported !!! :(", error);
    } finally {
      console.warn("audio is ready");

      //start audio sequencer
      const synth = new Tone.Synth().toDestination();
      const seq = new Tone.Sequence((time, note) => {

        //trigger notes/audio here


        //draw on schedule
        Tone.Draw.schedule(() => {
          
				// the callback synced to the animation frame at the given time here
				
        
			}, time);

       //index of sequence array
      }, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]).start(0);
      Tone.getTransport().start(); //start transport(player)
      //TODO test with metronome later to see if bpm is accurate. https://github.com/Tonejs/Tone.js/wiki/Performance

      //open up visuals
      setIsTonejsOn(true);
      
    }
  }

  return (
    <div>
      {isTonejsOn ? (
        <div>
          <CanvasCursor id='cursor'/>
          {/* <RecordMotion/> */}
          draw on the canvas here
        </div>
      ) : (
        <button onPointerDown={handleStartTonejs}>Start Player</button>
      )}
    </div>
  );
}
