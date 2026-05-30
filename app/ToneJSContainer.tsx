'use client'
import * as Tone from "tone";
import { useState } from "react";


export default function ToneJSContainer() {

    const [isTonejsOn, setIsTonejsOn] = useState(false);

    async function handleStartTonejs(){
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
        <button onPointerDown={handleStartTonejs}>
            Start Player
        </button>
    </div>
    
  );
}
