"use client";
import { PointerEvent, useRef, useState } from "react";
import RecordMotion from "../components/recordMotion";
import "./testmotion.css";

export default function ToneJSContainer() {

  //TODO initialize canvas,variables, and its functions here

  const recordMotionRef = useRef(null);
  const touchEventRef = useRef(null);


  function handleStartRecording(e: PointerEvent<HTMLElement>){
    recordMotionRef.current.startRecording(e);
  };

  // function handleOnClick(){
  //   //example handleChildEvent
  // }

  return (
    <div>
      <button onPointerDown={(e) => {
        handleStartRecording(e);
      }}>Click here to start recording</button>
      <RecordMotion ref={recordMotionRef} />
    </div>
  );
}
