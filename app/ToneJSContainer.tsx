"use client";
import { useState } from "react";
import * as Tone from "tone";
import CanvasCursor from "./components/cursors/CanvasCursor";

export default function ToneJSContainer() {
  const [isTonejsOn, setIsTonejsOn] = useState(false);

  async function handleStartTonejs() {
    //async function means run this function asynchronously so other code can be executed during loading

    try {
      // wait for audio context to start before playing audio
      await Tone.start(); //await says wait here until this calculation is done
      Tone.getTransport().start(); //start transport(player)
    } catch (error) {
      // only runs in the browser where the window object and AudioContext are available
      console.error("web audio api not supported !!! :(", error);
    } finally {
      console.warn("audio is ready");
      setIsTonejsOn(true);
    }
  }

  return (
    <div>
      {isTonejsOn ? (
        <div>
          <CanvasCursor id='canvas'></CanvasCursor>
          draw on the canvas here
        </div>
      ) : (
        <button onPointerDown={handleStartTonejs}>Start Player</button>
      )}
    </div>
  );
}
