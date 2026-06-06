'use client'
//TODO make this a functional react component 
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import "./recordMotion.css";

export default function RecordMotion({ref}) {

    let data = [];
    let currentFrame = 0;
    let recording = false;
    let isPlaying = false;

    let mouseX = 0;
    let mouseY = 0;
    let recordingLength = 0;
    let saveCounter = 1;
    let speedMultiple = 1;

    //ref to manipulate the DOM
    //(pass ref object as the ref attribute to JSX of DOM node to manipulate)
    const canvasRef = useRef(null);
    const ctx = useRef(null); //context

    useImperativeHandle(ref, () => {
        return {
            startRecording(event) {
                console.log('recording start');
                recording = true;
                isPlaying = false;
                data = [];
                recordingLength = 0;
                mouseX = event.clientX || event.touches[0].clientX;
                mouseY = event.clientY || event.touches[0].clientY;
                document.getElementById('sizeCounter').innerText = `Size: 0 bytes`;
            },

            stopRecording() {
                console.log('recording stopped');
                recording = false;
                isPlaying = true;
                recordingLength = data.length;
                currentFrame = 0;
            }
            
        }
    })

    useEffect(() => {

        //these are done after DOM is rendered.
        //everything only called once
        resizeCanvas();
        requestAnimationFrame(animate);

        ctx.current = document.getElementById("canvas").getContext("2d");


        const dropZone = document.getElementById('drop_zone');
        dropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            dropZone.style.backgroundColor = '#333';
        });

        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            dropZone.style.backgroundColor = '#222';
        });

        dropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            dropZone.style.backgroundColor = '#222';
            const file = e.dataTransfer.files[0];
            loadMotionFromFile(file);
        });

        window.addEventListener('resize', resizeCanvas);

        window.addEventListener('pointerup', function(event) {
            if (recording) stopRecording();
        });

        window.addEventListener('pointermove', function(event) {
            if (recording) updatePosition(event);
        });

        // document.getElementById("myText").innerHTML = targetFPS;
        return () => {
            //destroy the canvas 
        };
    },[]);


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
        console.log('recording start');
        recording = true;
        isPlaying = false;
        data = [];
        recordingLength = 0;
        mouseX = event.clientX || event.touches[0].clientX;
        mouseY = event.clientY || event.touches[0].clientY;
        document.getElementById('sizeCounter').innerText = `Size: 0 bytes`;
    }

    function stopRecording() {
        console.log('recording stop');
        recording = false;
        isPlaying = true;
        recordingLength = data.length;
        currentFrame = 0;
    }

    function updatePosition(event) {
        mouseX = event.clientX || event.touches[0].clientX;
        mouseY = event.clientY || event.touches[0].clientY;
    }

    // canvasRef.current.addEventListener('pointerdown', function(event) {
    //     if (event.pointerType === 'mouse' || event.pointerType === 'pen' || event.pointerType === 'touch') {
    //         startRecording(event);
    //     }
    // });

    

    // canvasRef.current.addEventListener('touchstart', function(event) {
    //     event.preventDefault();
    //     startRecording(event);
    // });

    // canvasRef.current.addEventListener('touchend', function(event) {
    //     event.preventDefault();
    //     stopRecording();
    // });

    // canvasRef.current.addEventListener('touchmove', function(event) {
    //     event.preventDefault();
    //     updatePosition(event);
    // });

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
        ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (recording) {
            data.push({ x: mouseX, y: mouseY });
            updateSizeCounter();
            ctx.current.fillStyle = 'red';
            ctx.current.fillRect(mouseX - 16, mouseY - 16, 32, 32);
        } else if (isPlaying) {
            if (currentFrame < recordingLength) {
                const p = data[Math.min(Math.round(currentFrame), recordingLength - 1)]; //min makes sure doesent index out of bounds, round makes sure the decimal is removed before searching the index
                ctx.current.fillStyle = 'green';
                ctx.current.fillRect(p.x - 16, p.y - 16, 32, 32);
                currentFrame += speedMultiple; //anything other than 1 will make playback a different speed, relative to the original speed.
            } else {
                currentFrame = 0;
            }
        } else {
            ctx.current.fillStyle = 'white';
            ctx.current.fillText("Press and hold to record, release to playback", 20, 20);
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
        reader.onload = function(event) {
            try {
                const loadedData = JSON.parse(event.target.result);
                data = loadedData;
                recordingLength = data.length;
                currentFrame = 0;
                isPlaying = true;
                document.getElementById('statusMessage').innerText = 'Motion data loaded successfully.';
                updateSizeCounter();
            } catch (e) {
                document.getElementById('statusMessage').innerText = 'Failed to load motion data.';
            }
        };
        reader.readAsText(file);
    }

    return (
        <div>
                
            {/* 
            TODO TRY CANVASREF.CURRENT. old version:
            ref={(canvasRef) => this.context = canvasRef.current.getContext('2d')} */}
            {/*TODO startRecording and stopRecording need to be called from parent using props 
            of the parent's useStates, put the props inside a useEffect that has the props in 
            the dependencies and they will auto update and call useEffect again. 
            This will cause a rerender in the child i think so it should be fine since
 */}
            <canvas 
            ref={canvasRef}
            onTouchStart={(e) => {e.preventDefault(); updatePosition(e);}}
            onTouchMove={(e) => {e.preventDefault(); updatePosition(e);}}
            onPointerDown={(e) => {e.preventDefault(); updatePosition(e);}}
            id="canvas"
            ></canvas>


            <div id="ui">
                <h3>Target FPS: <span id="myText"></span></h3>
                <button onClick={saveMotion}>Save Motion</button>
                <div id="drop_zone"
                onDragOver={saveMotion}
                >
                    Drag and drop saved motion file here to load
                </div>
                <div id="statusMessage"></div>
                <div id="sizeCounter">Size: 0 bytes</div>
            </div>

        </div>
        
    );
}