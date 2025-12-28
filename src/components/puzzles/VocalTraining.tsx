import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Mic, Play, Volume2, Info, Settings2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Simple "Flappy Bird" style game controlled by voice volume
export function VocalTraining() {
    const [isListening, setIsListening] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [volume, setVolume] = useState(0);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [sensitivity, setSensitivity] = useState(20);

    // Refs for game loop access without closure staleness
    const birdY = useRef(50);
    const velocity = useRef(0);
    const obstacles = useRef<{ x: number, gapTop: number, passed: boolean }[]>([]);
    const reqRef = useRef<number>(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const sensitivityRef = useRef(20);

    // Sync ref with state
    useEffect(() => {
        sensitivityRef.current = sensitivity;
    }, [sensitivity]);

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContextClass();

            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            analyserRef.current.smoothingTimeConstant = 0.5; // Smoother volume
            sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
            sourceRef.current.connect(analyserRef.current);

            setIsListening(true);
            setPermissionDenied(false);
            startGame();
            toast.success("Microphone connected! Sing to fly.");
        } catch (err: any) {
            console.error("Mic Error:", err);
            setPermissionDenied(true);
            toast.error(`Microphone access failed: ${err.message || "Unknown error"}`);
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
        obstacles.current = [{ x: 100, gapTop: 30, passed: false }];
        setScore(0);
        setIsPlaying(true);
        // Start game loop
        reqRef.current = requestAnimationFrame(gameLoop);
    };

    const gameLoop = () => {
        if (!analyserRef.current) return;

        // 1. Get Audio input (Volume)
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        // Skip first few bins (low frequency rumble) to reduce noise? No, vocals are low too.
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setVolume(average);

        // Physics
        const THRESHOLD = sensitivityRef.current;
        const GRAVITY = 0.5;
        const LIFT = -1.5;

        if (average > THRESHOLD) {
            // Scale lift by how much louder we are than threshold
            const intensity = (average - THRESHOLD) / 50;
            velocity.current += LIFT * (1 + Math.max(0, intensity));
        }
        velocity.current += GRAVITY;

        // Cap velocity
        velocity.current = Math.max(Math.min(velocity.current, 10), -12);

        birdY.current += velocity.current;

        // Boundaries
        if (birdY.current < 0) { birdY.current = 0; velocity.current = 0; }
        if (birdY.current > 100) {
            birdY.current = 100;
            gameOver();
            return;
        }

        // Obstacles logic...
        const SPEED = 0.5;
        obstacles.current.forEach(obs => obs.x -= SPEED);

        if (obstacles.current.length > 0 && obstacles.current[0].x < -20) {
            obstacles.current.shift();
        }

        if (obstacles.current.length === 0 || obstacles.current[obstacles.current.length - 1].x < 50) {
            obstacles.current.push({
                x: 100,
                gapTop: Math.random() * 50 + 10,
                passed: false
            });
        }

        // Collapse
        const BIRD_X_PERCENT = 20;
        const BIRD_SIZE_PERCENT = 5;

        obstacles.current.forEach(obs => {
            const obsWidth = 10;
            const gapHeight = 30;

            if (obs.x < BIRD_X_PERCENT + BIRD_SIZE_PERCENT && obs.x + obsWidth > BIRD_X_PERCENT) {
                if (birdY.current < obs.gapTop || birdY.current > obs.gapTop + gapHeight) {
                    gameOver();
                    return;
                }
            }

            if (!obs.passed && obs.x + obsWidth < BIRD_X_PERCENT) {
                obs.passed = true;
                setScore(s => s + 1);
            }
        });

        if (isPlaying) {
            // Continue loop ONLY if playing. Note: gameOver checks this but state update is async usually,
            // but here isPlaying is a closure var? No, React state. 
            // We need to check if we should continue. `startGame` sets local `isPlaying` logic visually,
            // but we rely on the `gameOver` function to cancel the animation frame.
            // However, `requestAnimationFrame` creates a new call.
            // We'll check the ref? No, better to just let `gameOver` cancel it.
            // But inside loop, we need to schedule next frame.
            reqRef.current = requestAnimationFrame(gameLoop);
        }
    };

    const gameOver = () => {
        setIsPlaying(false);
        cancelAnimationFrame(reqRef.current);
        toast("Game Over!", { description: `Score: ${score}` });
    };

    // Rendering loop (separate from physics to force React updates)
    useEffect(() => {
        let loop: number;
        if (isPlaying) {
            loop = requestAnimationFrame(function step() {
                setScore(s => s); // Dummy update to force re-render? No, we need setRenderTrigger pattern
                // Actually, `setVolume` in gameLoop triggers re-render!
                // So we probably don't need this separate loop if gameLoop calls setVolume every frame.
                // Optimally we shouldn't `setVolume` every frame (60fps react render).
                // But for this simple game, it's the mechanism that drives the view.
                // So I will remove the separate render loop and rely on `setVolume` to drive frames.
                // Wait, if volume doesn't change (silence), `setVolume` might bailout and not render movement?
                // Good point. We should force render.
                setRenderTrigger(prev => prev + 1);
                loop = requestAnimationFrame(step);
            });
        }
        return () => cancelAnimationFrame(loop);
    }, [isPlaying]);

    const [renderTrigger, setRenderTrigger] = useState(0);

    // Cleanup
    useEffect(() => {
        return () => stopListening();
    }, []);

    return (
        <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="pb-2 px-0 space-y-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Mic className="w-5 h-5 text-pink-500" />
                        Vocal Training
                    </CardTitle>
                    <div className="flex items-center gap-4">
                        <span className="font-mono text-xl font-bold text-pink-500">Score: {score}</span>
                    </div>
                </div>

                {/* Sensitivity Controls */}
                <div className="flex items-center gap-4 bg-slate-100 p-2 rounded-lg">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Settings2 className="w-4 h-4 text-slate-500" />
                            </TooltipTrigger>
                            <TooltipContent>Adjust microphone sensitivity</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <span className="text-xs font-semibold text-slate-500 w-16">Threshold</span>
                    <Slider
                        value={[sensitivity]}
                        onValueChange={(v) => setSensitivity(v[0])}
                        min={5}
                        max={60}
                        step={1}
                        className="w-32"
                    />

                    {/* Volume Meter with Threshold Marker */}
                    <div className="relative h-2 flex-1 bg-slate-200 rounded-full overflow-hidden mx-2">
                        {/* Threshold Marker */}
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                            style={{ left: `${sensitivity}%` }}
                        />
                        {/* Volume Bar */}
                        <div
                            className={cn("h-full transition-all duration-75",
                                volume > sensitivity ? "bg-green-500" : "bg-slate-400"
                            )}
                            style={{ width: `${Math.min(volume * 2, 100)}%` }} // Visual scale
                        />
                    </div>
                    <Volume2 className={cn("w-4 h-4", volume > sensitivity ? "text-green-600" : "text-slate-400")} />
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden relative bg-slate-900 rounded-xl border-2 border-slate-700 min-h-[300px]">

                {!isListening && !permissionDenied && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 text-white backdrop-blur-sm">
                        <div className="p-4 bg-slate-800 rounded-full mb-4 animate-pulse">
                            <Mic className="w-8 h-8 text-pink-500" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Enable Microphone</h3>
                        <p className="mb-6 text-slate-300 max-w-sm text-center text-sm">
                            Sing "Ahhh" to fly! <br />
                            Adjust the threshold slider if it's too hard/easy.
                        </p>
                        <Button onClick={startListening} size="lg" className="bg-pink-600 hover:bg-pink-700">
                            <Play className="w-5 h-5 mr-2" /> Start Game
                        </Button>
                    </div>
                )}

                {permissionDenied && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white">
                        <p className="text-red-400 mb-4 font-bold">Microphone access denied!</p>
                        <p className="text-slate-400 text-sm mb-4">Please allow microphone access in your browser settings.</p>
                        <Button variant="outline" onClick={() => window.location.reload()}>Reload Page</Button>
                    </div>
                )}

                {!isPlaying && isListening && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 text-white backdrop-blur-sm">
                        <h3 className="text-2xl font-bold text-pink-500 mb-2">Game Over!</h3>
                        <p className="text-xl mb-6">Score: {score}</p>
                        <Button onClick={startGame} size="lg">Play Again</Button>
                    </div>
                )}

                {/* Game World */}
                <div className="w-full h-full relative select-none pointer-events-none">
                    {/* Bird */}
                    <div
                        className="absolute w-[5%] h-[5%] bg-pink-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(236,72,153,0.6)] flex items-center justify-center transition-none will-change-transform"
                        style={{
                            left: '20%',
                            top: `${birdY.current}%`,
                            transform: 'translate(-50%, -50%)' // Center anchor
                        }}
                    >
                        <div className="w-1/2 h-1/2 bg-white/30 rounded-full" />
                    </div>

                    {/* Sensitivity Line Visual in Game (Optional, maybe distracting) */}

                    {/* Obstacles */}
                    {obstacles.current.map((obs, i) => (
                        <div key={i}>
                            <div
                                className="absolute bg-emerald-500 border-2 border-emerald-700 rounded-b-lg"
                                style={{ left: `${obs.x}%`, top: 0, width: '10%', height: `${obs.gapTop}%` }}
                            />
                            <div
                                className="absolute bg-emerald-500 border-2 border-emerald-700 rounded-t-lg"
                                style={{ left: `${obs.x}%`, top: `${obs.gapTop + 30}%`, width: '10%', bottom: 0 }}
                            />
                        </div>
                    ))}
                </div>

            </CardContent>
        </Card>
    );
}
