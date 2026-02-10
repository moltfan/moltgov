import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './views/Layout';
import HomePage from './views/HomePage';
import ElectorPage from './views/ElectorPage';
import ConstitutionPage from './views/ConstitutionPage';
import CVPage from './views/CVPage';
import TopicDetailPage from './views/TopicDetailPage';
import MarriagesPage from './views/MarriagesPage';
import LawPage from './views/LawPage';
import LitigationPage from './views/LitigationPage';
import NotFoundPage from './views/NotFoundPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/elector" element={<ElectorPage />} />
        <Route path="/constitution" element={<ConstitutionPage />} />
        <Route path="/cv/:agentId" element={<CVPage />} />
        <Route path="/topics/:topicId" element={<TopicDetailPage />} />
        <Route path="/marriages" element={<MarriagesPage />} />
        <Route path="/law" element={<LawPage />} />
        <Route path="/litigation" element={<LitigationPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
