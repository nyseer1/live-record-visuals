'use client'
//TODO make this a functional react component 
import { useEffect, useRef, useImperativeHandle } from "react";

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

    //cursor
    const fRef = useRef(null);
    const linesRef = useRef([]);
    // const posRef = useRef({
    //   x: window.innerWidth / 2,
    //   y: window.innerHeight / 2,
    // });

    const posRef = useRef({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
    });
    const animationFrameId = useRef(null);

    const E = {
        friction: 0.5,
        trails: 20,
        size: 50,
        dampening: 0.25,
        tension: 0.98,
    };

    function PhaseWave({ phase = 0, offset = 0, frequency = 0.001, amplitude = 1 }) {
        let _phase = phase;
        return {
            update() {
                _phase += frequency;
                return offset + Math.sin(_phase) * amplitude;
            },
        };
    }

    class Node {
        constructor(x, y) {
            this.x = x || 0;
            this.y = y || 0;
            this.vx = 0;
            this.vy = 0;
        }
    }

    class Line {
        constructor(spring) {
            this.spring = spring + 0.1 * Math.random() - 0.02;
            this.friction = E.friction + 0.01 * Math.random() - 0.002;
            this.nodes = [];
            for (let i = 0; i < E.size; i++) {
                this.nodes.push(new Node(posRef.current.x, posRef.current.y));
            }
        }

        update() {
            let spring = this.spring;
            let t = this.nodes[0];
            t.vx += (posRef.current.x - t.x) * spring;
            t.vy += (posRef.current.y - t.y) * spring;

            for (let i = 0; i < this.nodes.length; i++) {
                t = this.nodes[i];
                if (i > 0) {
                    const prev = this.nodes[i - 1];
                    t.vx += (prev.x - t.x) * spring;
                    t.vy += (prev.y - t.y) * spring;
                    t.vx += prev.vx * E.dampening;
                    t.vy += prev.vy * E.dampening;
                }
                t.vx *= this.friction;
                t.vy *= this.friction;
                t.x += t.vx;
                t.y += t.vy;
                spring *= E.tension;
            }
        }

        draw(ctx) {
            ctx.beginPath();
            ctx.moveTo(this.nodes[0].x, this.nodes[0].y);

            for (let i = 1; i < this.nodes.length - 2; i++) {
                const c = this.nodes[i];
                const d = this.nodes[i + 1];
                const xc = (c.x + d.x) / 2;
                const yc = (c.y + d.y) / 2;
                ctx.quadraticCurveTo(c.x, c.y, xc, yc);
            }
            // curve through the last two points
            const secondLast = this.nodes[this.nodes.length - 2];
            const last = this.nodes[this.nodes.length - 1];
            ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);
            ctx.stroke();
            ctx.closePath();
        }
    }

    const onMouseMove = (e) => {
        if (!canvasRef.current) return;
        //find the scaling of the canvas
        const rect = canvasRef.current.getBoundingClientRect();
        const scaleX = canvasRef.current.width / rect.width;
        const scaleY = canvasRef.current.height / rect.height;

        //screen xy to canvas xy based on scaling
        posRef.current.x = (e.clientX - rect.left) * scaleX;
        posRef.current.y = (e.clientY - rect.top) * scaleY;
    };

    // const resizeCanvas = () => {
    //     if (!ctxRef.current) return;
    //     const canvas = ctxRef.current.canvas;
    //     canvas.width = window.innerWidth - 20;
    //     canvas.height = window.innerHeight;
    // };

    const render = () => {
        if (!ctxRef.current) return;
        const ctx = ctxRef.current;

        // ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = `hsla(${Math.round(fRef.current.update())}, 50%, 50%, 0.2)`;
        ctx.lineWidth = 1;

        for (let i = 0; i < E.trails; i++) {
            const line = linesRef.current[i];
            line.update();
            line.draw(ctx);

        }
        ctx.frame++;
        //replaced with one inside main draw method
        // animationFrameId.current = requestAnimationFrame(render); 
    };

    useImperativeHandle(ref, () => {
        return {
            handleRecording() { //clears old recording, i could make it overwrite ontop of previous
                if (!recording) {
                    recording = true;
                    isPlaying = false;
                    data = [];
                    recordingLength = 0;
                }
                else { //stop rec
                    recording = false;
                    isPlaying = true;
                    recordingLength = data.length;
                    currentFrame = 0;
                }


                // mouseX = event.clientX - canvas.offsetLeft;
                // mouseY = event.clientY - canvas.offsetTop;
                // document.getElementById('sizeCounter').innerText = `Size: 0 bytes`; //save/load file (file size)
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
        animationFrameId.current = requestAnimationFrame(animate);
        // requestAnimationFrame(animate);

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

        //glowing wavy line cursor
        if (canvasRef.current === null) return;
        ctxRef.current.running = true;
        ctxRef.current.frame = 1;

        fRef.current = PhaseWave({
            phase: Math.random() * 2 * Math.PI,
            amplitude: 85,
            frequency: 0.0015,
            offset: 285,
        });

        linesRef.current = [];
        for (let i = 0; i < E.trails; i++) {
            linesRef.current.push(new Line(0.4 + (i / E.trails) * 0.025));
        }




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
            ctxRef.current.running = false;

        };
    }, []);

    //FPS CAP
    const targetFPS = 60;
    const targetFrameDuration = 1000 / targetFPS; // ~16.67ms  
    let lastTime = 0;

    function resizeCanvas() {
        canvasRef.current.width = window.innerWidth / 2;
        canvasRef.current.height = window.innerHeight / 2;
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
        animationFrameId.current = requestAnimationFrame(animate);
        // requestAnimationFrame(animate);
    }

    function draw() {

        //use clearRect unless another render func calls it
        // ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); //always clear
        if (recording) {

            //glowing wavy line cursor
            render();

            if (paint) { //if mouse/touch down is happening, draw
                data.push({ x: mouseX, y: mouseY });
                // updateSizeCounter();

                //simple green box curosor
                // ctxRef.current.fillStyle = 'red';
                // ctxRef.current.fillRect(mouseX - 16, mouseY - 16, 32, 32);

            }
            else {
                data.push(null);
            }

        } else if (isPlaying) {
            if (currentFrame < recordingLength) { //p is frame
                const p = data[Math.min(Math.round(currentFrame), recordingLength - 1)]; //min makes sure doesent index out of bounds, round makes sure the decimal is removed before searching the index

                //glowing wavy line cursor
                render();

                if (p !== null) { //if motion happened at this frame

                    //simple green box curosor
                    // ctxRef.current.fillStyle = 'green';
                    // ctxRef.current.fillRect(p.x - 16, p.y - 16, 32, 32);

                    //update position based on recorded data for custom cursors
                    posRef.current.x = p.x;
                    posRef.current.y = p.y;

                }
                currentFrame += speedMultiple; //anything other than 1 will make playback a different speed, relative to the original speed.

            } else {
                currentFrame = 0;
            }
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
        onMouseMove(e);
    }
    function handlePointerUp(e) {
        e.preventDefault(); updatePosition(e); paint = false;
        onMouseMove(e);

    }
    function handlePointerMove(e) {
        if (e.buttons !== 1) return; //confirm that user is either left clicking or touching (necessary on pointerMove events to prevent overlapping on pointerDown events)
        e.preventDefault(); updatePosition(e);
        onMouseMove(e);
    }

    // TODO TEST IF THE CANVAS EVENTS WORK
    //TODO i might need to add events in useCanvasCursor to make sure it only paints when paint is true
    return (
        <div >
            <canvas
                ref={canvasRef}
                onTouchStart={(e) => handlePointerDown(e)}
                onTouchEnd={(e) => handlePointerUp(e)}
                onTouchMove={(e) => handlePointerMove(e)}
                onPointerDown={(e) => handlePointerDown(e)}
                onPointerMove={(e) => handlePointerMove(e)}
                onPointerUp={(e) => handlePointerUp(e)}
                id="canvas"
                style={{ border: ' 1px solid #aacccc' }}
            > </canvas>

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