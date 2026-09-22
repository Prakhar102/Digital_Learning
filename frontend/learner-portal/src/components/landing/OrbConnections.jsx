function OrbConnections() {
  return (
    <>
      {/* TOP LINE */}
      <div
        className="
        absolute
        left-1/2
        top-[85px]

        w-px
        h-[100px]

        -translate-x-1/2

        bg-[#3E7C74]/50
        "
      />

      {/* BOTTOM LINE */}
      <div
        className="
        absolute
        left-1/2
        bottom-[85px]

        w-px
        h-[100px]

        -translate-x-1/2

        bg-[#3E7C74]/50
        "
      />

      {/* LEFT LINE */}
      <div
        className="
        absolute
        left-[140px]
        top-1/2

        w-[80px]
        h-px

        bg-[#3E7C74]/50
        "
      />

      {/* RIGHT LINE */}
      <div
        className="
        absolute
        right-[140px]
        top-1/2

        w-[80px]
        h-px

        bg-[#3E7C74]/50
        "
      />
    </>
  );
}

export default OrbConnections;