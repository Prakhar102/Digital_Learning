import { useEffect, useState } from "react";

function MouseGlow() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const move = (e) => {
      setPosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener(
      "mousemove",
      move
    );

    return () =>
      window.removeEventListener(
        "mousemove",
        move
      );
  }, []);

  return (
    <div
      className="
      fixed
      pointer-events-none
      z-0
      "
      style={{
        left: position.x - 250,
        top: position.y - 250,

        width: "500px",
        height: "500px",

        borderRadius: "50%",

        background:
          "radial-gradient(circle, rgba(62,124,116,0.22) 0%, transparent 70%)",

        filter: "blur(80px)",

        transition:
          "left 0.25s ease-out, top 0.25s ease-out",
      }}
    />
  );
}

export default MouseGlow;