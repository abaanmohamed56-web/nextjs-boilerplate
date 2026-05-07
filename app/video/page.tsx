import dynamic from "next/dynamic";

const VideoPlayer = dynamic(() => import("./VideoPlayer"), { ssr: false });

export default function VideoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <h1 className="mb-8 text-3xl font-semibold text-black dark:text-white">
        Remotion Player
      </h1>
      <div className="w-full max-w-4xl">
        <VideoPlayer />
      </div>
    </div>
  );
}
