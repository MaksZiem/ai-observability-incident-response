"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

const RESET_AFTER_MS = 2000;

type CopyButtonProps = {
  value: string;
};

export function CopyButton({ value }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), RESET_AFTER_MS);
  }

  const Icon = copied ? Check : Copy;

  return (
    <Button onClick={copy} aria-label="Copy to clipboard">
      <Icon className="size-4" strokeWidth={1.75} aria-hidden />
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}
