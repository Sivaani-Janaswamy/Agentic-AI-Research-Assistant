import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PaperComparison from './pages/PaperComparison';
import PdfUpload from './pages/PdfUpload';
import ResearchGapDetector from './pages/ResearchGapDetector';
import RelatedPapers from './pages/RelatedPapers';
import FavoritePapers from './pages/FavoritePapers';
import Home from './pages/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/PaperComparison" element={<PaperComparison />} />
      <Route path="/PdfUpload" element={<PdfUpload />} />
      <Route path="/ResearchGapDetector" element={<ResearchGapDetector />} />
      <Route path="/RelatedPapers" element={<RelatedPapers />} />
      <Route path="/FavoritePapers" element={<FavoritePapers />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
    </Routes>
  );
}

export default App;