import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <Image
//        className="dark:invert"
        src="/icons/Logo_128.png"
        alt="InNotes logo"
        width={150}
        height={150}
        priority
      />

      <div className="text-4xl font-bold mt-4">InNotes</div>
      <div className="text-xl mt-2 text-gray-700 text-center">
        Transform LinkedIn into your personal CRM
      </div>

      <section className="mt-12 max-w-2xl flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>
            <b>Private Notes:</b> Take notes on any LinkedIn profile, visible
            only to you.
          </li>
          <li>
            <b>Lead Status:</b> Assign a lead status to each contact (e.g.,
            "New," "Contacted," "Qualified").
          </li>
          <li>
            <b>Tags:</b> Add tags for easy categorization and filtering.
          </li>
          <li>
            <b>Quick Search:</b> Easily search through your notes to find the
            right contact.
          </li>
        </ul>
      </section>

      <section className="mt-8 max-w-2xl flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
        <p className="text-lg text-gray-600 text-center">
          InNotes is free for basic usage. A small contribution is required for
          intense usage to help with hosting costs.
        </p>
      </section>

      <div className="mt-8 flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-4">Download</h2>
        <div className="flex space-x-4 items-center">
          <a
            href="https://chromewebstore.google.com/detail/innotes/obdanlbbjoobopjlkgnchfhkfafhjkfh"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/icons/GoogleBadge.png"
              alt="Chrome Web Store"
              width={166}
              height={58}
              style={{ objectFit: "contain", height: "58px", width: "auto" }}
            />
          </a>

          <a
            href="https://chromewebstore.google.com/detail/innotes/obdanlbbjoobopjlkgnchfhkfafhjkfh"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/icons/AppleBadge.png"
              alt="Download on the Mac App Store"
              width={166}
              height={58}
              style={{
                filter: "grayscale(100%)",
                objectFit: "contain",
                width: "193px",
              }}
            />
          </a>
        </div>
      </div>

      <div className="mt-16 footer-container text-sm text-gray-500">
        Made with <span>❤</span>️ by{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="http://marco.visin.ch"
          className="underline"
        >
          Marco Visin - www.visin.ch
        </a>
      </div>
    </div>
  );
}
