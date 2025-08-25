import TopBar from "@/app/_common/components/top-bar";
import GalleryBody from "./_components/gallery-body";

export default function Gallery() {
    return (
        <div className="min-h-screen flex flex-col">
            <TopBar highlight="gallery"/>
            <main className="flex-1">
                <GalleryBody />
            </main>
        </div>
    );
}


