// Spline preview page for DAB (no header). Uses the Spline viewer web component with strong scaling to zoom out.
"use client";

import { useEffect } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "spline-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        url?: string;
        loading?: string;
      };
    }
  }
}

export default function DabSplinePreviewPage() {
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-spline-viewer]"
    );
    if (existing) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@splinetool/viewer@1.10.96/build/spline-viewer.js";
    script.dataset.splineViewer = "true";
    document.head.appendChild(script);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        marginLeft: "calc(50% - 50vw)",
        marginRight: "calc(50% - 50vw)",
        padding: 0,
        height: "5000px", // scroll runway
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "5000px",
          transform: "scale(0.05)", // strong zoom-out
          transformOrigin: "top center",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <spline-viewer
          url="/world.splinecode?cb=3"
          loading="lazy"
          aria-label="DAB Spline preview"
          style={{
            display: "block",
            width: "24000px", // oversize to keep content visible when scaled down
            height: "18000px",
            border: "0",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
}
