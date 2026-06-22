'use client'
//TODO make this a functional react component 
import { useEffect, useRef, useImperativeHandle } from "react";
import "./recordMotion.css";

export default function CanvasRecordMotion({ ref }) {


    //todo put useCursor here for custom cursor hook

    let data = [];
    let currentFrame = 0;
    let recording = false;
    let isPlaying = false;

    let mouseX = 0;
    let mouseY = 0;
    let recordingLength = 0;
    let saveCounter = 1;
    let speedMultiple = 1;
    let paint = false;

    //ref to manipulate the DOM
    //(pass ref object as the ref attribute to JSX of DOM node to manipulate)
    const canvasRef = useRef(null);
    const ctxRef = useRef(null); //context

    useImperativeHandle(ref, () => {
        return {
            startRecording(event) { //clears old recording, i could make it overwrite ontop of previous
                recording = true;
                isPlaying = false;
                data = [];
                recordingLength = 0;
                mouseX = event.clientX - canvas.offsetLeft;
                mouseY = event.clientY - canvas.offsetTop;
                // document.getElementById('sizeCounter').innerText = `Size: 0 bytes`; //save/load file (file size)
            },

            stopRecording() { //starts playback 
                recording = false;
                isPlaying = true;
                recordingLength = data.length;
                currentFrame = 0;
            },
            calculateSpeed() {
                //TODO find speed necessary to do specific bpm
            }
        }
    })

    useEffect(() => {

        //these are done after DOM is rendered.
        //everything only called once
        resizeCanvas();
        requestAnimationFrame(animate);

        ctxRef.current = document.getElementById("canvas").getContext("2d");

        //drag and drop file upload
        // const dropZone = document.getElementById('drop_zone');
        // dropZone.addEventListener('dragover', function(e) {
        //     e.preventDefault();
        //     dropZone.style.backgroundColor = '#333';
        // });

        // dropZone.addEventListener('dragleave', function(e) {
        //     e.preventDefault();
        //     dropZone.style.backgroundColor = '#222';
        // });

        // dropZone.addEventListener('drop', function(e) {
        //     e.preventDefault();
        //     dropZone.style.backgroundColor = '#222';
        //     const file = e.dataTransfer.files[0];
        //     loadMotionFromFile(file);
        // });

        window.addEventListener('resize', resizeCanvas);

        // window.addEventListener('pointerup', function(event) {
        //     if (recording) stopRecording();
        // });

        window.addEventListener('pointermove', function (event) {
            if (recording) updatePosition(event);
        });

        // document.getElementById("myText").innerHTML = targetFPS;
        return () => {
            //destroy the canvas 
        };
    }, []);

    //TODO TURN THE EVENT LISTENERS (that arent window because window isnt being referenced) into react events & handlers 

    //FPS CAP
    const targetFPS = 60;
    const targetFrameDuration = 1000 / targetFPS; // ~16.67ms  
    let lastTime = 0;

    function resizeCanvas() {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
    }

    function updateSizeCounter() {
        const jsonString = JSON.stringify(data, null, 2);
        const bytes = new Blob([jsonString]).size;
        document.getElementById('sizeCounter').innerText = `Size: ${bytes} bytes`;
    }

    function startRecording(event) {
        getPosition(event); //sets coord.x and coord.y
        recording = true;
        isPlaying = false;
        data = [];
        recordingLength = 0;
        mouseX = event.clientX - canvas.offsetLeft;
        mouseY = event.clientY - canvas.offsetTop;
        // document.getElementById('sizeCounter').innerText = `Size: 0 bytes`; //save/load file (file size)
        paint = true;

    }

    function stopRecording() {
        recording = false;
        isPlaying = true;
        recordingLength = data.length;
        currentFrame = 0;
        paint = false;

    }

    function updatePosition(event) {
        mouseX = event.clientX - canvas.offsetLeft;
        mouseY = event.clientY - canvas.offsetTop;
    }

    // ANIMATION ----------------------------------------------------------------------------------------------------------

    function animate(currentTime) {
        // Calculate time since last frame  
        const elapsed = currentTime - lastTime;

        // Only update/draw if enough time has passed (clamps to each 1/60th second for consistent 60fps)
        if (elapsed >= targetFrameDuration) {
            lastTime = currentTime - (elapsed % targetFrameDuration); // Account for excess time  

            // Update(reset/clear canvas) and draw
            draw();
        }

        // Always request next frame, even if nothing was changed
        requestAnimationFrame(animate);
    }

    function draw() {

        //not needed with wavecursor hook
        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); //always clear
        if (recording) {
            if (paint) { //if mouse/touch down is happening, draw
                data.push({ x: mouseX, y: mouseY });
                // updateSizeCounter();
                //not needed with wavecursor hook
                ctxRef.current.fillStyle = 'red';
                ctxRef.current.fillRect(mouseX - 16, mouseY - 16, 32, 32);
            }
            else {
                data.push(null);
            }

        } else if (isPlaying) {
            if (currentFrame < recordingLength) { //p is frame
                const p = data[Math.min(Math.round(currentFrame), recordingLength - 1)]; //min makes sure doesent index out of bounds, round makes sure the decimal is removed before searching the index

                if (p !== null) { //if motion happened at this frame
                    //not needed with wavecursor hook
                    ctxRef.current.fillStyle = 'green';
                    ctxRef.current.fillRect(p.x - 16, p.y - 16, 32, 32);

                }
                //TODO IF NULL MAKE EMPTY FRAME
                else {
                }

                currentFrame += speedMultiple; //anything other than 1 will make playback a different speed, relative to the original speed.

            } else {
                currentFrame = 0;
            }
        } else {
            ctxRef.current.fillStyle = 'white';
        }
    }

    function saveMotion() {
        const motionData = JSON.stringify(data, null, 2);
        const blob = new Blob([motionData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const filename = `motion_data_${saveCounter++}.json`;
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function loadMotionFromFile(file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                const loadedData = JSON.parse(event.target.result);
                data = loadedData;
                recordingLength = data.length;
                currentFrame = 0;
                isPlaying = true;
                document.getElementById('statusMessage').innerText = 'Motion data loaded successfully.';
                // updateSizeCounter();
            } catch (e) {
                document.getElementById('statusMessage').innerText = 'Failed to load motion data.';
            }
        };
        reader.readAsText(file);
    }

    //HANDLERS -------------------------------------------------------------------------------
    function handlePointerDown(e) {
        e.preventDefault(); updatePosition(e); paint = true;
    }
    function handlePointerUp(e) {
        e.preventDefault(); updatePosition(e); paint = false;
    }
    function handlePointerMove(e) {
        e.preventDefault(); updatePosition(e);
    }

    // TODO TEST IF THE CANVAS EVENTS WORK
    //TODO i might need to add events in useCanvasCursor to make sure it only paints when paint is true
    return (
        <div>
            <canvas
                ref={canvasRef}
                onTouchStart={(e) => handlePointerDown(e)}
                onTouchEnd={(e) => handlePointerUp(e)}
                onTouchMove={(e) => handlePointerMove(e)}
                onPointerDown={(e) => handlePointerDown(e)}
                onPointerUp={(e) => handlePointerUp(e)}
                id="canvas"
            ></canvas>

            {/* save/load motion */}
            {/* <div id="ui">
                <h3>Target FPS: <span id="myText"></span></h3>
                <button onClick={saveMotion}>Save Motion</button>
                <div id="drop_zone"
                onDragOver={saveMotion}
                >
                    Drag and drop saved motion file here to load
                </div>
                <div id="statusMessage"></div>
                <div id="sizeCounter">Size: 0 bytes</div>
            </div> */}

        </div>

    );
}