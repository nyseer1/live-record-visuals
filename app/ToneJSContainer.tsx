"use client";
import { useState, useRef } from "react";
import * as Tone from "tone";
import CanvasRecordMotion from "./components/CanvasRecordMotion";

export default function ToneJSContainer() {
  const [isTonejsOn, setIsTonejsOn] = useState(false);
  const draw = Tone.getDraw(); //new func to get draw object
  const [beat, setBeat] = useState(0);

  const spanRef = useRef(null);

  //TODO useRef to store data that is not needed for render (like a sequence array)
  const customCanvasRef = useRef(null); //to ref html canvas

  async function handleStartTonejs() {
    //async = run func asynchronously so other code can run simultaneously
    try {
      await Tone.start(); //await = wait until calc done, tone.start start audio context
    } catch (error) {
      console.error("web audio api not supported !!! :(", error);
    } finally {
      console.warn("audio is ready");

      //start audio sequencer
      const synth = new Tone.Synth().toDestination();
      const seq = new Tone.Sequence(
        (time, note) => {
          //trigger notes/audio here
          //trigger visuals on schedule here
          const noteRef = note;
          draw.schedule(() => {
            // the callback synced to the animation frame at the given time here
            if (note === 0) {
              //sequence start
              customCanvasRef.current.handleRecording(); //start/stop
            }
            spanRef.current.textContent = note;
          }, time); //this syncs it to transport time
          //index of sequence array
        },
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      ).start(0);

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
          <CanvasRecordMotion ref={customCanvasRef} />
          <span ref={spanRef}></span>
          <br style={{ lineHeight: "1" }} />
          <br style={{ lineHeight: "50" }} />
          <span>Made By Nyseer Couse</span>
          {/* <RecordMotion/> */}
        </div>
      ) : (
        <button onPointerDown={handleStartTonejs}>Start Player</button>
      )}
    </div>
  );
}
