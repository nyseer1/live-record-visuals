import React from 'react';
import useCanvasCursor from './useCanvasCursor';

export default function CanvasCursor({id}) {
    //TODO FIND OUT HOW TO CROP THIS CANVAS INTO A DIV
    
  useCanvasCursor();

  

  return (
    <canvas
      id="canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 2,
        width: '100vw',
        height: '100vh',
      }}
    />
  );
}
