import { MantineProvider } from '@mantine/core';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@mantine/core/styles.css';
import { ModelList } from './components/ModelList';
import { ModelForm } from './components/ModelForm';
import { ModelDetail } from './components/ModelDetail';

function App() {
  return (
    <MantineProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ModelList />} />
          <Route path="/new" element={<ModelForm />} />
          <Route path="/models/:id" element={<ModelDetail />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
