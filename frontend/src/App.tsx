import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DeploymentPage from './pages/DeploymentPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/deployment/:id" element={<DeploymentPage />} />
      </Routes>
    </Router>
  );
}

export default App;