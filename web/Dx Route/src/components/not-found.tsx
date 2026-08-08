import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/base/ui/button";
import { Daikanoid } from "@/features/portfolio/components/daikanoid";

export function NotFound() {
  return (
    <div className="grid min-h-svh place-items-center py-6">
      <section className="max-lg:hidden">
        <Daikanoid />
      </section>

      <section className="flex flex-col items-center gap-6 lg:hidden">
        <h1 className="font-mono text-8xl font-medium">404</h1>
        <Button
          variant="outline"
          nativeButton={false}
          render={
            <Link href="/">
              Go to Home
              <ArrowRightIcon />
            </Link>
          }
        />
      </section>
    </div>
  );
}
