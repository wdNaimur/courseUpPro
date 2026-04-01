import { FileImage, FileJson, Tags } from "lucide-react";

const metadataFiles = [
  {
    fileName: "course.json",
    summary: "Stores the display title used in the library.",
    icon: FileJson,
  },
  {
    fileName: "priority.txt",
    summary: "Keeps the course label simple and editable.",
    icon: Tags,
  },
  {
    fileName: "thumbnail.png",
    summary: "Provides the library card cover image.",
    icon: FileImage,
  },
];

export default function HomePageMetadataSection() {
  return (
    <div className="editorial-panel fade-in-up rounded-[2rem] p-5 md:p-6 [animation-delay:260ms]">
      <div>
        <p className="section-label">Folder files</p>
        <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--theme-text)]">
          Metadata that can travel with the course
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--theme-text-muted)]">
          When writable access exists, CourseUp saves key library details
          directly into the course folder instead of relying only on browser
          storage.
        </p>
      </div>

      <div className="mt-6 grid gap-3">
        {metadataFiles.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.fileName}
              className="theme-soft-panel flex items-start gap-3 rounded-[1.4rem] p-4"
            >
              <div className="theme-soft-panel-strong rounded-xl p-2.5">
                <Icon className="h-4 w-4 text-[var(--theme-accent-soft)]" />
              </div>
              <div>
                <p className="text-sm font-black text-[var(--theme-text)]">
                  {item.fileName}
                </p>
                <p className="mt-1 text-sm leading-6 text-[var(--theme-text-muted)]">
                  {item.summary}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
