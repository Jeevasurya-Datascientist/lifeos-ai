import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Grid, Eraser, RotateCcw, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// Simple initial valid board pattern (shifts) to guarantee validity
const INITIAL_BOARD = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

export function Sudoku() {
    const { user } = useAuth();
    const [initialGrid, setInitialGrid] = useState<number[][]>([]); // Immutable starting nums
    const [grid, setGrid] = useState<number[][]>([]); // Player state
    const [selected, setSelected] = useState<[number, number] | null>(null);
    const [wins, setWins] = useState(0);
    const [solved, setSolved] = useState(false);

    useEffect(() => {
        newGame();
    }, []);

    useEffect(() => {
        loadWins();
    }, [user]);

    const loadWins = async () => {
        if (!user) return;
        const { count } = await supabase
            .from('brain_training_scores')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('game_type', 'sudoku');
        if (count !== null) setWins(count);
    };

    const newGame = () => {
        // Simple logic: Take INITIAL_BOARD, maybe transpose/swap to create variety in future
        // For MVP: Just mask random cells
        const newG = INITIAL_BOARD.map(row => [...row]);

        // Remove 30-40 numbers
        for (let i = 0; i < 40; i++) {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            newG[r][c] = 0;
        }

        setInitialGrid(newG.map(r => [...r]));
        setGrid(newG.map(r => [...r]));
        setSelected(null);
        setSolved(false);
    };

    const handleInput = (num: number) => {
        if (!selected || solved) return;
        const [r, c] = selected;
        // Cannot edit initial cells
        if (initialGrid[r][c] !== 0) return;

        const newGrid = grid.map(row => [...row]);
        newGrid[r][c] = num;
        setGrid(newGrid);

        checkCompletion(newGrid);
    };

    // Helper to check if a specific cell has a conflict
    const getConflict = (r: number, c: number, val: number) => {
        if (val === 0) return false;

        // Row
        for (let k = 0; k < 9; k++) if (k !== c && grid[r][k] === val) return true;
        // Col
        for (let k = 0; k < 9; k++) if (k !== r && grid[k][c] === val) return true;
        // Box
        const br = Math.floor(r / 3) * 3;
        const bc = Math.floor(c / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if ((br + i !== r || bc + j !== c) && grid[br + i][bc + j] === val) return true;
            }
        }
        return false;
    };



    const checkCompletion = (currentGrid: number[][]) => {
        // Check if full
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (currentGrid[r][c] === 0) return;
            }
        }

        // Validate
        if (isValidSudoku(currentGrid)) {
            setSolved(true);
            saveWin();
        }
    };

    const isValidSudoku = (board: number[][]) => {
        // Simplified check since we started from valid board and user filled it
        // Just checking against the static INITIAL_BOARD is easiest cheat-check for MVP,
        // BUT if we implemented shuffling, we need real validation.
        // Let's implement real validation for robustness.

        const isValidSet = (arr: number[]) => {
            const s = new Set<number>();
            for (let x of arr) {
                if (x < 1 || x > 9 || s.has(x)) return false;
                s.add(x);
            }
            return true;
        };

        // Rows
        for (let r = 0; r < 9; r++) if (!isValidSet(board[r])) return false;

        // Cols
        for (let c = 0; c < 9; c++) {
            const col = [];
            for (let r = 0; r < 9; r++) col.push(board[r][c]);
            if (!isValidSet(col)) return false;
        }

        // Boxes
        for (let br = 0; br < 3; br++) {
            for (let bc = 0; bc < 3; bc++) {
                const box = [];
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        box.push(board[br * 3 + r][bc * 3 + c]);
                    }
                }
                if (!isValidSet(box)) return false;
            }
        }
        return true;
    };

    const saveWin = async () => {
        setWins(w => w + 1);
        if (!user) return;
        await supabase.from('brain_training_scores').insert({
            user_id: user.id,
            game_type: 'sudoku',
            score: 1,
            metadata: { date: new Date().toISOString() }
        });
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Grid className="w-5 h-5 text-blue-500" />
                        Sudoku
                    </div>
                    <div className="text-sm font-normal text-muted-foreground">Solved: {wins}</div>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center space-y-4">
                {solved ? (
                    <div className="text-center space-y-4">
                        <Check className="w-16 h-16 text-green-500 mx-auto" />
                        <h3 className="text-2xl font-bold text-green-600">Solved!</h3>
                        <Button onClick={newGame}>New Game</Button>
                    </div>
                ) : (
                    <>
                        {/* Grid */}
                        <div className="grid grid-cols-9 border-2 border-black bg-black gap-px w-full max-w-[320px] aspect-square">
                            {grid.map((row, r) => (
                                row.map((val, c) => {
                                    const isInitial = initialGrid[r][c] !== 0;
                                    const isSelected = selected?.[0] === r && selected?.[1] === c;
                                    const hasConflict = !isInitial && getConflict(r, c, val);

                                    // Thick borders for 3x3 boxes
                                    const borderR = (r + 1) % 3 === 0 && r !== 8 ? "border-b-2 border-black" : "";
                                    const borderC = (c + 1) % 3 === 0 && c !== 8 ? "border-r-2 border-black" : "";

                                    return (
                                        <div
                                            key={`${r}-${c}`}
                                            onClick={() => setSelected([r, c])}
                                            className={`
                                                bg-white flex items-center justify-center text-lg cursor-pointer select-none
                                                ${isInitial ? "font-bold text-black" : hasConflict ? "text-red-500 font-bold" : "text-blue-600"}
                                                ${isSelected ? "bg-blue-200" : ""}
                                                ${(r === selected?.[0] || c === selected?.[1]) && !isSelected ? "bg-blue-50" : ""}
                                            `}
                                        >
                                            {val !== 0 && val}
                                        </div>
                                    );
                                })
                            ))}
                        </div>

                        {/* Numpad */}
                        <div className="grid grid-cols-5 gap-2 w-full max-w-[320px]">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <Button key={num} variant="outline" onClick={() => handleInput(num)} className="h-10">
                                    {num}
                                </Button>
                            ))}
                            <Button variant="secondary" onClick={() => handleInput(0)} className="h-10 text-red-500">
                                <Eraser className="w-4 h-4" />
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
