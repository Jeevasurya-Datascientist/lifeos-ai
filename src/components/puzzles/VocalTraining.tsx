import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mic, Play, Square, Trophy, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Simple "Flappy Bird" style game controlled by voice volume/pitch
// For robustness without external libraries, we'll use Volume (Amplitude) to control height/jump.
// 'Ahhh' to fly up, silence to fall.

export function VocalTraining() {
    const [isListening, setIsListening] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [volume, setVolume] = useState(0);
    const [permissionDenied, setPermissionDenied] = useState(false);

    // Game Physics State
    const birdY = useRef(50); // % height (0 top, 100 bottom)
    const velocity = useRef(0);
    const obstacles = useRef<{ x: number, gapTop: number, passed: boolean }[]>([]);
    const reqRef = useRef<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 400;

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass();

            // Resume context if suspended (browser requirements)
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);

            setIsListening(true);
            setPermissionDenied(false);
            startGame();
        } catch (err) {
            console.error("Mic Error:", err);
            setPermissionDenied(true);
        }
    };

    const stopListening = () => {
        if (sourceRef.current) sourceRef.current.disconnect();
        if (analyserRef.current) analyserRef.current.disconnect();
        if (audioContextRef.current) audioContextRef.current.close();
        setIsListening(false);
        setIsPlaying(false);
        cancelAnimationFrame(reqRef.current);
    };

    const startGame = () => {
        birdY.current = 50;
        velocity.current = 0;
        obstacles.current = [{ x: 100, gapTop: 30, passed: false }]; // Initial obstacle
        setScore(0);
        setIsPlaying(true);
        gameLoop();
    };

    const gameLoop = () => {
        if (!analyserRef.current) return;

        // 1. Get Audio input (Volume)
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setVolume(average); // visual feedback

        // Physics
        // If volume > threshold, fly up. Else fall.
        const THRESHOLD = 20;
        const GRAVITY = 0.5;
        const LIFT = -1.5;

        // Smooth control: Higher volume = stronger lift
        if (average > THRESHOLD) {
            velocity.current += LIFT * (average / 50); // Scale lift by loudness
        }
        velocity.current += GRAVITY;

        // Cap velocity
        velocity.current = Math.max(Math.min(velocity.current, 10), -10);

        birdY.current += velocity.current;

        // Boundaries
        if (birdY.current < 0) { birdY.current = 0; velocity.current = 0; }
        if (birdY.current > 100) {
            birdY.current = 100;
            gameOver();
            return;
        }

        // Obstacles
        // Move obstacles
        const SPEED = 0.5; // percent width per frame
        obstacles.current.forEach(obs => obs.x -= SPEED);

        // Remove off-screen
        if (obstacles.current.length > 0 && obstacles.current[0].x < -20) {
            obstacles.current.shift();
        }

        // Add new
        if (obstacles.current.length === 0 || obstacles.current[obstacles.current.length - 1].x < 50) {
            obstacles.current.push({
                x: 100,
                gapTop: Math.random() * 50 + 10, // Random gap position
                passed: false
            });
        }

        // Collision & Score
        // Bird X is fixed at approx 20%
        const BIRD_X_PERCENT = 20;
        const BIRD_SIZE_PERCENT = 5; // approx

        obstacles.current.forEach(obs => {
            // Collision Logic (Approximate box)
            const obsWidth = 10; // percent
            const gapHeight = 30; // percent

            // Check x overlap
            if (obs.x < BIRD_X_PERCENT + BIRD_SIZE_PERCENT && obs.x + obsWidth > BIRD_X_PERCENT) {
                // Check y overlap (hit pipe?)
                if (birdY.current < obs.gapTop || birdY.current > obs.gapTop + gapHeight) {
                    gameOver();
                    return;
                }
            }

            // Score
            if (!obs.passed && obs.x + obsWidth < BIRD_X_PERCENT) {
                obs.passed = true;
                setScore(s => s + 1);
            }
        });

        if (isPlaying) {
            reqRef.current = requestAnimationFrame(gameLoop);
        }
    };

    const gameOver = () => {
        setIsPlaying(false);
        cancelAnimationFrame(reqRef.current);
    };

    useEffect(() => {
        return () => {
            stopListening();
        };
    }, []);

    // Re-render handled by requestAnimationFrame? No, React state updates (volume, score) trigger re-render specific parts
    // We need to force a render for the canvas/game view if we're not using <canvas> directly but DOM elements.
    // Using DOM elements for simplicity in React without Canvas API overhead.
    // To make it smooth, we use a ref-driven animation frame but we need to update React state for positions? 
    // Actually, updating React state 60fps is bad. 
    // Let's use a specialized hook or just a simple requestAnimationFrame that forceUpdates?
    // Or better: Use `style` refs directly on elements if possible, or accept 60fps setStates for this simple game.
    // For this simple demo, we'll try `requestAnimationFrame` driving state, but wrap in `useRef` where possible to minimize re-renders if performance sucks.
    // Actually, let's just use a `useEffect` with a timer for the render loop that reads the refs.

    const [renderTrigger, setRenderTrigger] = useState(0);
    useEffect(() => {
        let loop: number;
        if (isPlaying) {
            loop = requestAnimationFrame(function step() {
                setRenderTrigger(prev => prev + 1); // Force re-render of frame
                loop = requestAnimationFrame(step);
            });
        }
        return () => cancelAnimationFrame(loop);
    }, [isPlaying]);


    return (
        <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="pb-2 px-0">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Mic className="w-5 h-5 text-pink-500" />
                        Vocal Training (Sing to Fly!)
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Volume2 className={cn("w-4 h-4", volume > 20 ? "text-green-500" : "text-muted-foreground")} />
                            <div className="h-2 w-20 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-500 transition-all duration-75"
                                    style={{ width: `${Math.min(volume, 100)}%` }}
                                />
                            </div>
                        </div>
                        <span className="font-mono text-lg font-bold">Score: {score}</span>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden relative bg-slate-900 rounded-xl border-2 border-slate-700">

                {!isListening && !permissionDenied && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 text-white backdrop-blur-sm">
                        <div className="p-4 bg-slate-800 rounded-full mb-4">
                            <Mic className="w-8 h-8 text-pink-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Enable Microphone</h3>
                        <p className="mb-6 text-slate-300 max-w-sm text-center">
                            Control the bird with your voice! <br />
                            <span className="text-pink-400 font-bold">Sing Ahhhh!</span> or <span className="text-pink-400 font-bold">Speak Loudly</span> to fly up. <br />
                            Be quiet to fall down.
                        </p>
                        <Button onClick={startListening} size="lg" className="bg-pink-600 hover:bg-pink-700">
                            <Play className="w-5 h-5 mr-2" /> Start Game
                        </Button>
                    </div>
                )}

                {permissionDenied && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white">
                        <p className="text-red-400 mb-4">Microphone access denied.</p>
                        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
                    </div>
                )}

                {!isPlaying && isListening && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 text-white backdrop-blur-sm">
                        <h3 className="text-2xl font-bold text-pink-500 mb-2">Game Over!</h3>
                        <p className="text-xl mb-6">Score: {score}</p>
                        <Button onClick={startGame} size="lg">Try Again</Button>
                    </div>
                )}

                {/* Game World (Percent Based) */}
                <div className="w-full h-full relative">
                    {/* Bird */}
                    <div
                        className="absolute w-[5%] h-[5%] bg-pink-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(236,72,153,0.6)] flex items-center justify-center transition-none"
                        style={{
                            left: '20%',
                            top: `${birdY.current}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div className="w-1/2 h-1/2 bg-white/30 rounded-full" />
                    </div>

                    {/* Obstacles / Pipes */}
                    {obstacles.current.map((obs, i) => (
                        <div key={i}>
                            {/* Top Pipe */}
                            <div
                                className="absolute bg-emerald-500 border-2 border-emerald-700 rounded-b-lg"
                                style={{
                                    left: `${obs.x}%`,
                                    top: 0,
                                    width: '10%',
                                    height: `${obs.gapTop}%`
                                }}
                            />
                            {/* Bottom Pipe */}
                            <div
                                className="absolute bg-emerald-500 border-2 border-emerald-700 rounded-t-lg"
                                style={{
                                    left: `${obs.x}%`,
                                    top: `${obs.gapTop + 30}%`, // Gap is 30%
                                    width: '10%',
                                    bottom: 0
                                }}
                            />
                        </div>
                    ))}
                </div>

            </CardContent>
        </Card>
    );
}
