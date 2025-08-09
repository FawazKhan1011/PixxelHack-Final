'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import '../../styles/assess.css';

const phq9Questions = [
  { question: 'Little interest or pleasure in doing things', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
  { question: 'Feeling down, depressed, or hopeless', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
  { question: 'Trouble falling or staying asleep, or sleeping too much', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
  { question: 'Feeling tired or having little energy', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
  { question: 'Poor appetite or overeating', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
  { question: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
  { question: 'Trouble concentrating on things, such as reading the newspaper or watching television', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
  { question: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
  { question: 'Thoughts that you would be better off dead or of hurting yourself in some way', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
];

const AssessmentForm = () => {
  const { user } = useUser();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);

  useEffect(() => {
    if (user && score !== null && severity) {
      const assessment = { type: 'PHQ-9', score, severity };
      const stored = localStorage.getItem(`assessment_${user.id}`) || '[]';
      const assessments = JSON.parse(stored);
      assessments.push(assessment);
      localStorage.setItem(`assessment_${user.id}`, JSON.stringify(assessments));
    }
  }, [score, severity, user]);

  const handleAnswer = (value: number) => {
    setResponses((prev) => [...prev, value]);
    if (currentQuestion < phq9Questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitAssessment([...responses, value]);
    }
  };

  const submitAssessment = (finalResponses: number[]) => {
    const total = finalResponses.reduce((a, b) => a + b, 0);
    const sev = getSeverity(total);
    const crisis = finalResponses[8] > 0;

    setScore(total);
    setSeverity(sev);
    setShowCrisis(crisis);

    // Save "has taken" flag for first-time login redirect
    if (user) {
      localStorage.setItem(`hasTakenAssessment_${user.id}`, 'true');
    }

    // Redirect to dashboard with score info
    router.push(`/dashboard?score=${total}&severity=${encodeURIComponent(sev)}&crisis=${crisis}`);
  };

  const getSeverity = (score: number) => {
    if (score >= 20) return 'Severe';
    if (score >= 15) return 'Moderately Severe';
    if (score >= 10) return 'Moderate';
    if (score >= 5) return 'Mild';
    return 'Minimal';
  };

  if (score !== null) {
    return (
      <motion.div className="auth-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Card className="assess-card">
          <CardHeader>
            <CardTitle>Assessment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="auth-text">PHQ-9 Score: <strong>{score}</strong></p>
            <Progress value={(score / 27) * 100} className="mt-2" />
            <Alert variant={severity === 'Severe' ? 'destructive' : 'default'} className="mt-4">
              <AlertTitle>Severity: {severity}</AlertTitle>
              <AlertDescription>
                Your PHQ-9 score indicates {severity?.toLowerCase()} depression.
                {severity === 'Severe' && ' Please seek professional help immediately.'}
              </AlertDescription>
            </Alert>
            {showCrisis && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Crisis Alert</AlertTitle>
                <AlertDescription>
                  You may be experiencing a crisis. Please contact a professional or call 112 (India) immediately.
                </AlertDescription>
              </Alert>
            )}
            <Button className="auth-button mt-4 w-full" onClick={() => { setScore(null); setCurrentQuestion(0); setResponses([]); setShowCrisis(false); }}>
              Retake Assessment
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div className="auth-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Card className="assess-card">
        <CardHeader>
          <CardTitle>PHQ-9 Question {currentQuestion + 1} of 9</CardTitle>
          <Progress value={(currentQuestion / (phq9Questions.length - 1)) * 100} className="mt-2" />
        </CardHeader>
        <CardContent>
          <p className="auth-text">{phq9Questions[currentQuestion].question}</p>
          <div className="button-group">
            {phq9Questions[currentQuestion].options.map((option, index) => (
              <Button key={index} onClick={() => handleAnswer(index)} className="auth-button mt-2 w-full">
                {option}
              </Button>
            ))}
          </div>
          {showCrisis && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Crisis Alert</AlertTitle>
              <AlertDescription>
                You may be experiencing a crisis. Please contact a professional or call 112 (India) immediately.
              </AlertDescription>
            </Alert>
          )}
          <center>
            <p className="auth-footer mt-4">Not a substitute for professional help.</p>
          </center>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AssessmentForm;
