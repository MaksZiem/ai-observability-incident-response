import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

type ApiKeyRevealProps = {
  projectId: string;
  apiKey: string;
};

export function ApiKeyReveal({ projectId, apiKey }: ApiKeyRevealProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold">Project created</h2>
        <p className="text-[13px] text-fg-muted">
          Copy the API key now. It is shown only once; if you lose it, rotate it
          in project settings.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-surface-2 px-3 py-2 font-mono text-[13px]">
          {apiKey}
        </code>
        <CopyButton value={apiKey} />
      </div>

      <p className="text-[13px] text-fg-muted">
        Send it in the <code className="font-mono text-fg">x-api-key</code>{" "}
        header to <code className="font-mono text-fg">/api/ingest/*</code>.
      </p>

      <Link
        href={`/projects/${projectId}`}
        className={`${buttonClasses("primary")} self-start`}
      >
        Continue to project
      </Link>
    </div>
  );
}
