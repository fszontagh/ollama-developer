// utils/console.ts
export function countVisualRows(text: string, columns: number = process.stdout.columns ?? 80): number {
    return text.split('\n').reduce((acc, line) => {
        const lineLength = line.replace(/\x1b\[[0-9;]*m/g, '').length; // strip ANSI
        return acc + Math.max(1, Math.ceil(lineLength / columns));
    }, 0);
}

export function clearLines(rows: number) {
    for (let i = 0; i < rows; i++) {
        process.stdout.write('\x1B[1A'); // Up
        process.stdout.write('\r');     // Start of line
        process.stdout.write('\x1B[2K'); // Clear line
    }
}
