import { useState } from "react";
import Navbar from "./components/Navbar/Navbar";
import Dashboard from "./Pages/Dashboard";
import PYQAnalyzer from "./Pages/PYQAnalyzer";
import AIMentor from "./Pages/AIMentor";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <>
      <Navbar current={page} onNavigate={setPage} />

      {page === "dashboard" && (
        <Dashboard onNavigate={setPage} />
      )}

      {page === "pyq" && <PYQAnalyzer />}

      {page === "mentor" && <AIMentor />}
    </>
  );
}