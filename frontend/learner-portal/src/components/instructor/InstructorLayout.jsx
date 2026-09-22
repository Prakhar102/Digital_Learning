import InstructorSidebar from "./InstructorSidebar";

function InstructorLayout({
  children,
}) {
  return (
    <div
      className="
      min-h-screen
      bg-[#060B14]
      text-white
      "
    >
      <InstructorSidebar />

      <main
        className="
        ml-[290px]
        min-h-screen
        p-8
        "
      >
        {children}
      </main>
    </div>
  );
}

export default InstructorLayout;