'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Book } from 'lucide-react';
import '../../styles/assessmentlist.css';
interface AssessmentInfo {
  id: string;
  title: string;
  description: string;
  officialLink: string;
  sourceName: string;
}

const assessments: AssessmentInfo[] = [
  {
    id: 'phq9',
    title: 'PHQ-9 (Patient Health Questionnaire-9)',
    description: 'A widely used instrument for screening, diagnosing, monitoring, and measuring the severity of depression.',
    officialLink: 'https://www.mdcalc.com/calc/1725/phq9-patient-health-questionnaire9',
    sourceName: 'PHQ Screeners',
  },
  {
    id: 'gad7',
    title: 'GAD-7 (Generalized Anxiety Disorder 7-item Scale)',
    description: 'A validated tool for screening and measuring the severity of generalized anxiety disorder.',
    officialLink: 'https://www.hiv.uw.edu/page/mental-health-screening/gad-7',
    sourceName: 'HIV UW',
  },
  {id: 'k10',
    title: 'K10 (Kessler Psychological Distress Scale)',
    description: 'A 10-item questionnaire to measure psychological distress, identifying risks for anxiety and depression. Free PDF.',
    officialLink: 'https://www.healthfocuspsychology.com.au/tools/k10/',
    sourceName: 'Health Focus Psychology',
  },
  {
    id: 'pcl5',
    title: 'PCL-5 (PTSD Checklist for DSM-5)',
    description: 'A self-report measure that assesses the 20 DSM-5 symptoms of PTSD.',
    officialLink: 'https://traumadissociation.com/pcl5-ptsd',
    sourceName: 'Trauma Dissociation',
  },
  {
    id: 'dass21',
    title: 'DASS-21 (Depression, Anxiety, and Stress Scale)',
    description: 'A 21-item self-report scale to measure depression, anxiety, and stress. Free form available for download.',
    officialLink: 'https://www.icliniq.com/tool/dass-depression-anxiety-stress-scale-21',
    sourceName: 'iCliniq',
  },
];

export default function AssessmentListPage() {
  return (
    <div className="ya-page ya-assessment-list">
      <header className="page-header">
        <h1>Mental Health Assessments</h1>
        <p className="page-subtitle">
          Official medical-standard screening tools and questionnaires to help you assess your mental wellness.
        </p>
      </header>

      <section className="assessment-cards-container">
        {assessments.map(({ id, title, description, officialLink, sourceName }) => (
          <Card key={id} className="assessment-card">
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="assessment-description">{description}</p>

              <div className="assessment-footer">
                <a
                  href={officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="official-link"
                  aria-label={`Official website for ${title} by ${sourceName}`}
                >
                  Learn more on {sourceName}
                </a>

                <Button
                  size="sm"
                  onClick={() => {
                    window.location.assign(officialLink);
                  }}
                >
                  Take Assessment
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
