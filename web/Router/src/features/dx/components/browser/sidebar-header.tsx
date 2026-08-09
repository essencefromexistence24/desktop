"use client";

import { Cog, PanelLeft, ShieldAlert, ShieldBan, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { BrowserScreen } from "@/features/dx/components/screens/browser-screen";
import { CodeScreen } from "@/features/dx/components/screens/code-screen";
import { TerminalScreen } from "@/features/dx/components/screens/terminal-screen";
import { WelcomeScreen } from "@/features/dx/components/screens/welcome-screen";

const screenItems = [
  { id: "welcome", label: "Welcome", component: WelcomeScreen },
  // { id: "terminal", label: "Terminal", component: TerminalScreen },
  // { id: "code", label: "Code Editor", component: CodeScreen },
  // { id: "browser", label: "Browser", component: BrowserScreen },
];

interface SidebarHeaderProps {
  sidebarExpanded: boolean;
  onToggleSidebar: () => void;
}

export function SidebarHeader({ sidebarExpanded, onToggleSidebar }: SidebarHeaderProps) {
  const [cogDialogOpen, setCogDialogOpen] = useState(false);

  return (
    <div className="grid h-11 shrink-0 grid-cols-2 gap-px">
      {sidebarExpanded ? (
        <>
          <div className="bg-card flex items-center gap-1 px-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
              onClick={onToggleSidebar}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
              onClick={() => setCogDialogOpen(true)}
            >
              <Cog className="h-4 w-4" />
            </Button>
          </div>
          <div className="bg-card flex items-center justify-end gap-1 px-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
            >
              <ShieldAlert className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
            >
              <ShieldBan className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="bg-card col-span-2 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8"
            onClick={onToggleSidebar}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={cogDialogOpen} onOpenChange={setCogDialogOpen}>
        <DialogContent
          aria-describedby={undefined}
          className="flex h-full max-h-[85vh] w-full flex-col gap-0 rounded-2xl border-border bg-background p-0 max-w-4xl lg:min-w-[1100px] overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
        >
          <DialogTitle className="sr-only">Screens</DialogTitle>
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">Screens</h2>
          </div>
          <div className="divide-y divide-border overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
            {screenItems.map(({ id, label, component: Component }) => (
              <div key={id} className="p-6">
                <h3 className="mb-4 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {label}
                </h3>
                <div className="h-[400px] rounded-xl border border-border shadow-sm overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
                  <Component />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
