'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Assuming you have this Button component
import { GoogleGenerativeAI } from '@google/generative-ai';
import '../../styles/privateDiary.css'; // Ensure this path is correct
import router from 'next/router';
import { LogOut } from 'lucide-react';
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const exitToDashboard = () => {
    window.location.assign('/dashboard');
  };

export default function PrivateDiary() {
  const [diaryText, setDiaryText] = useState('');
  const [reflection, setReflection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReflection = async () => {
    if (!diaryText.trim()) return;

    setLoading(true);
    setError(null);
    setReflection(null);

    try {
      const systemPrompt = `You are "You Matter AI", a compassionate and empathetic wellness companion.
Provide a warm, supportive reflection on the following diary entry written by the user about their day.
Make sure to highlight positive aspects and offer encouragement, being kind and understanding.`;

      const response = await model.generateContent([
        { text: systemPrompt },
        { text: diaryText.trim() },
      ]);

      setReflection(response.response.text());
    } catch (e) {
      setError('Sorry, something went wrong. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="private-diary-container">
    <Button onClick={exitToDashboard} className="exit-btn">
    <LogOut className="btn-icon-small" />
        Exit
    </Button>
  <h1 className="page-title">Personal Diary</h1>
  <p className="page-meta">Reflect on your day and let AI help you gain insights</p>
  <textarea
    className="diary-textarea"
    placeholder="Write about your day..."
    value={diaryText}
    onChange={(e) => setDiaryText(e.target.value)}
    rows={10}
    disabled={loading}
  />
      <Button onClick={handleReflection} disabled={loading || !diaryText.trim()} size="lg">
        {loading ? 'Reflecting...' : 'AI Reflection'}
      </Button>

      {reflection && (
        <section className="reflection-result">
          <h2>Your AI Reflection</h2>
          <p>{reflection}</p>
        </section>
      )}

      {error && <p className="error-text">{error}</p>}
    </main>
  );
}
