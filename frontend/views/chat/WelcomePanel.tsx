import { MessageSquare } from "lucide-react";

export default function WelcomePanel() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8 bg-muted/20">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
        <MessageSquare size={28} className="text-muted-foreground" />
      </div>
      <div className="space-y-1.5 max-w-xs">
        <h2 className="text-base font-semibold">Your messages</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Select a conversation from the sidebar to start chatting, or start a new one.
        </p>
      </div>
    </div>
  );
}