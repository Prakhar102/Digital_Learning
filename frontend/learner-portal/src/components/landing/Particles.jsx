function Particles() {
  const particles = [
    { left: "5%", top: "10%" },
    { left: "15%", top: "25%" },
    { left: "25%", top: "40%" },
    { left: "35%", top: "60%" },
    { left: "45%", top: "20%" },
    { left: "55%", top: "75%" },
    { left: "65%", top: "35%" },
    { left: "75%", top: "50%" },
    { left: "85%", top: "15%" },
    { left: "95%", top: "70%" },

    { left: "10%", top: "80%" },
    { left: "20%", top: "55%" },
    { left: "30%", top: "15%" },
    { left: "40%", top: "85%" },
    { left: "50%", top: "45%" },
    { left: "60%", top: "10%" },
    { left: "70%", top: "65%" },
    { left: "80%", top: "30%" },
    { left: "90%", top: "90%" },
  ];

  return (
    <div
      className="
      fixed
      inset-0
      pointer-events-none
      overflow-hidden
      "
    >
      {particles.map((particle, index) => (
        <span
          key={index}
          className="
          absolute
          h-1
          w-1
          rounded-full
          bg-white/40
          "
          style={{
            left: particle.left,
            top: particle.top,
          }}
        />
      ))}
    </div>
  );
}

export default Particles;