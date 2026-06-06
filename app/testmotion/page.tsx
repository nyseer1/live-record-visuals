"use client";
import { PointerEvent, useRef, useState } from "react";
import RecordMotion from "../components/WaveRecordMotion";

export default function ToneJSContainer() {

  const recordMotionRef = useRef<any>(null);
  // const touchEventRef = useRef(null);
  const [isMotion, setIsMotion] = useState(false);

  function handleStartRecording(e: PointerEvent<HTMLElement>){
    if(recordMotionRef.current === null) return;
    recordMotionRef.current.startRecording(e);
  };
  function handleStopRecording(){
    if(recordMotionRef.current === null) return;
    recordMotionRef.current.stopRecording();
  }

  return (
    <>
      {isMotion ? (
        <button onPointerDown={(e) => {handleStopRecording(); setIsMotion(true)}}>Start Playback</button>
      ) : (
        <button onPointerDown={(e) => {handleStartRecording(e); setIsMotion(true)}}>
          Click here to start recording
        </button>
      )}
      <RecordMotion ref={recordMotionRef} />
    </>
  );
}
