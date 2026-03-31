import { BadgeCheck, FolderSync, HardDriveDownload } from "lucide-react";

const workflowSteps = [
  {
    label: "Import",
    title: "Pick a course folder",
    description:
      "Bring in a local folder once and let the app index the lesson videos automatically.",
    icon: HardDriveDownload,
  },
  {
    label: "Sync",
    title: "Store metadata beside the course",
    description:
      "Title, priority, and thumbnail can live inside the folder so your setup survives browser resets.",
    icon: FolderSync,
  },
  {
    label: "Resume",
    title: "Jump back into lessons fast",
    description:
      "Open the latest course, restore folder access, and continue from the current progress state.",
    icon: BadgeCheck,
  },
];

export default function HomePageWorkflowSection() {
  return (
    <div className="editorial-panel fade-in-up rounded-[2rem] p-5 md:p-6 [animation-delay:220ms]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="section-label">Workflow</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[var(--theme-text)]">
            A cleaner path from folder to playback
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {workflowSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="theme-soft-panel rounded-[1.5rem] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="section-label">{step.label}</span>
                <Icon className="h-4 w-4 text-[var(--theme-accent-soft)]" />
              </div>
              <h3 className="mt-4 text-lg font-black text-[var(--theme-text)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--theme-text-muted)]">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
