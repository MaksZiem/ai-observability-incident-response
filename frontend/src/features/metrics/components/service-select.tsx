"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";

type ServiceSelectProps = {
  services: string[];
  value: string | undefined;
};

export function ServiceSelect({ services, value }: ServiceSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function select(service: string) {
    const query = new URLSearchParams(searchParams);
    if (service) query.set("service", service);
    else query.delete("service");

    startTransition(() => {
      router.replace(`${pathname}?${query}`, { scroll: false });
    });
  }

  return (
    <Select
      aria-label="Service"
      value={value ?? ""}
      disabled={pending}
      onChange={(event) => select(event.target.value)}
      className="font-mono"
    >
      <option value="">All services</option>
      {services.map((service) => (
        <option key={service} value={service}>
          {service}
        </option>
      ))}
    </Select>
  );
}
