import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/NavBar";
import Footer from "../components/layout/Footer";

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-secondary font-sans">
      {/* 1. Header is fixed at the top */}
      <Navbar />

      {/* 2. Main content grows to fill space */}
      <main className="grow w-full max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* 3. Footer is always at the bottom */}
      <Footer />
    </div>
  );
};

export default MainLayout;
