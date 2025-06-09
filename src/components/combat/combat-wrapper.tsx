"use client";

import dynamic from "next/dynamic";

const CombatContainer = dynamic(() => import("./combat-container"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Loading AI Combat Experience...</h2>
        <p className="text-muted-foreground">Please wait while we prepare the AI combat interface</p>
      </div>
    </div>
  ),
});

export default CombatContainer; 