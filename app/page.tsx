import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Image
        className="dark:invert"
        src="/icons/InNotes.png"
        alt="InNotes logo"
        width={150}
        height={150}
        priority
      />
      <div className={"title-container"}>Easy Note-Taking for LinkedIn</div>
      <h1 className="text-3xl font-bold mb-4">Coming Soon</h1>
      <p className="text-lg text-gray-600 mb-8 text-center">
        We are working hard to bring you a great note-taking experience for
        LinkedIn. Stay tuned!
      </p>
      <div className={"footer-container"}>
        Made with <span>❤</span>️ by{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="http://marco.visin.ch"
        >
          Marco Visin - www.visin.ch
        </a>
      </div>
    </div>
  );
}
