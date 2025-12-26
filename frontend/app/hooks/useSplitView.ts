import { useEffect, useRef, useState } from "react";

export default function useSplitView(initialPercent: number = 55) {
    const [splitPercent, setSplitPercent] = useState<number>(initialPercent);
    const isDragging = useRef(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleMouseMove(e: MouseEvent) {
            if (!isDragging.current || !containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const rawPercent = (x / rect.width) * 100;

            // Cap between 35% and 65% so both sides remain usable
            const clamped = Math.min(65, Math.max(35, rawPercent));
            setSplitPercent(clamped);
        }

        function handleMouseUp() {
            if (!isDragging.current) return;
            isDragging.current = false;
            document.body.classList.remove('select-none', 'cursor-col-resize');
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const startDragging = () => {
        isDragging.current = true;
        document.body.classList.add('select-none', 'cursor-col-resize');
    };

    return {
        splitPercent,
        containerRef,
        startDragging,
    };
}