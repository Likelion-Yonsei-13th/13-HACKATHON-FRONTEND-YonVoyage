// app/gallery/_components/skeletons.tsx
export function CardSkeleton() {
    return (
        <div className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border animate-pulse">
            <div className="h-56 w-full bg-gray-200" />
            <div className="p-3">
                <div className="h-4 w-1/2 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
            </div>
        </div>
    );
}
