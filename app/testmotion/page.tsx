"use client";
import { PointerEvent, useRef, useState } from "react";
import CanvasRecordMotion from "../components/CanvasRecordMotion";

export default function TestingPage() {

  const recordMotionRef = useRef<any>(null);
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
        <button onPointerDown={(e) => {handleStopRecording();}}>Start Playback</button>
      ) : (
        <button onPointerDown={(e) => {handleStartRecording(e); setIsMotion(true)}}>
          Click here to start recording
        </button>
      )}
      <CanvasRecordMotion ref={recordMotionRef} />
    </>
  );
}
