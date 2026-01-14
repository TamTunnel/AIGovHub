import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MantineProvider } from "@mantine/core";
import { ModelList } from "./components/ModelList";
import { ModelForm } from "./components/ModelForm";
import { ModelDetail } from "./components/ModelDetail";
import { ComplianceDashboard } from "./components/ComplianceDashboard";
import { PolicyList } from "./components/PolicyList";
import { PolicyViolations } from "./components/PolicyViolations";
import { AppShell } from "./components/layout/AppShell";

function App() {
  return (
    <MantineProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<ModelList />} />
            <Route path="/dashboard" element={<ComplianceDashboard />} />
            <Route path="/policies" element={<PolicyList />} />
            <Route path="/violations" element={<PolicyViolations />} />
            <Route path="/new" element={<ModelForm />} />
            <Route path="/models/:id" element={<ModelDetail />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
