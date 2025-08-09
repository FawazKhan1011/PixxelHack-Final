'use client';
import { useEffect, useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ThemeToggle } from '../components/theme-toggle';
import '../../styles/dashboard.css';
import Chatimg from "../../img/chat.png";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Bot } from 'lucide-react';

// Define interface for assessment data
interface Assessment {
  type: 'PHQ-9' | 'GAD-7';
  score: number;
  severity: string;
  created_at?: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState<string>('Dashboard');

  useEffect(() => {
  if (user) {
    const stored = localStorage.getItem(`assessment_${user.id}`) || '[]';
    const parsed: Assessment[] = JSON.parse(stored).map((item: Partial<Assessment>) => ({
  type: item.type === "PHQ-9" ? "PHQ-9" : "GAD-7",
  score: item.score ?? 0,
  severity: item.severity ?? "",
  created_at: item.created_at ?? new Date().toISOString()
}));

    setAssessments(parsed);
  }
}, [user]);


  const lastAssessment = assessments[assessments.length - 1];

  const modules = [
    { id: 'Dashboard', icon: '🏠', href: '/' },
    { id: 'Quick Assessment', icon: '📝', href: '/assess' },
    { id: 'AI Chat', icon: '💬', href: '/ai' },
    { id: 'Meditation', icon: '🧘', href: '/meditation' },
    { id: 'Personal Diary', icon: '📔', href: '/diary' },
    { id: 'Resources', icon: '📚', href: '/resources' },
    { id: 'Profile', icon: '👤', href: '/profile' },
    { id: 'Admin', icon: '⚙️', href: '/admin' },
  ];

  const handleModuleClick = (m: { id: string; href?: string }) => {
    setActiveModule(m.id);
    if (m.href) {
      window.location.assign(m.href);
    }
  };

  const MOTIVATIONS = [
    "Take one small step today — you matter.",
    "Breathe in calm — breathe out worry.",
    "Progress isn't linear. Be kind to yourself today.",
  ];
  const randomMot = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];

  return (
    <div className="ya-dashboard">
      <aside className={`ya-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="ya-sidebar-top">
          <div className="ya-logo-text">{sidebarOpen ? 'You Matter' : 'YM'}</div>
          {/* <button
            className="ya-collapse-btn"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '«' : '☰'}
          </button> */}
        </div>

        <nav className="ya-nav">
          <ul>
            {modules.map((m) => (
              <li
                key={m.id}
                className={`ya-nav-item ${activeModule === m.id ? 'active' : ''}`}
                onClick={() => handleModuleClick(m)}
              >
                <span className="ya-nav-icon">{m.icon}</span>
                {sidebarOpen && <span className="ya-nav-label">{m.id}</span>}
              </li>
            ))}
          </ul>
        </nav>

        <div className="ya-sidebar-bottom">
          <div className="ya-utilities">
            {/* <ThemeToggle /> */}
            {/* <UserButton /> */}
          </div>
        </div>
      </aside>


      <main className="ya-main">
        <header className="ya-header">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="ya-header-left"
          >
          </motion.div>

          <div className="ya-header-right flex items-center gap-4">
  <Button>
    <Link href="/assess">Start Quick Check</Link>
  </Button>
  <div className="userbutton">
    <UserButton />
  </div>
</div>
        </header>

        <section className="ya-grid">
          <motion.section
            layout
            className="ya-card profile-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="profile-top">
              <div className="profile-pic">
                {/* fallback avatar */}
                <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden>
                  <circle cx="20" cy="14" r="8" fill="var(--accent-gradient)"></circle>
                  <rect x="6" y="26" width="28" height="8" rx="4" fill="#f1f3f8"></rect>
                </svg>
              </div>
              <div className="profile-name">
                <strong>{user?.firstName+ ' ' + user?.lastName}</strong>

                <div className="profile-sub">YouMatter member</div>
              </div>
            </div>

            <div className="profile-body">
              <div className="score-row">
                <div className="score-block">
                  <div className="score-label">Last Test</div>
                  <div className="score-value">
                    {lastAssessment ? `${lastAssessment.type}: ${lastAssessment.score}` : 'No tests yet'}
                  </div>
                  {lastAssessment && (
                    <div className="score-severity">{lastAssessment.severity}</div>
                  )}
                </div>

                <div className="progress-block">
                  <div className="progress-label">Wellness</div>
                  <Progress value={Math.min(100, (lastAssessment?.score ?? 6) * 10)} />
                </div>
              </div>

              <div className="motivation">
                <div className="mot-text">{randomMot}</div>
                <Button onClick={() => alert('Play quick breathing...')}>Do a 1-min breathing</Button>
              </div>
            </div>
          </motion.section>

          <motion.section
            layout
            className="ya-card chat-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
              <Card className="max-w-md mx-auto text-center p-4">
  {/* Heading */}
  <h2 className="text-2xl font-bold mb-2">You Matter Chatbot</h2>

  {/* Logo */}
<center>
  <Bot 
  width={64}
  height={100}
  className="avatar-icon" />
</center>

  {/* Start Chat Button */}
  <Button 
    className="mb-4 w-full" 
    size="lg"
    onClick={() => window.location.assign('/ai')}
  >
    Start Chat
  </Button>

  {/* Quick Prompts */}
  <p className="text-sm text-muted-foreground mb-2">Try quick prompts:</p>
  <div className="flex flex-wrap justify-center gap-2">
    {["Breathing Techniques", "Coping Tips", "7-day Plan for Stress Relief"].map((prompt) => (
      <Button 
        key={prompt}
        size="sm"
        variant="secondary"
        onClick={() => router.push(`/ai?q=${encodeURIComponent(prompt)}`)}
      >{prompt}
      </Button>
    ))}
  </div>
</Card>
          </motion.section>

          <motion.section
            layout
            className="ya-card breathing-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <CardHeader>
              <CardTitle>Calming Micro-UX</CardTitle>
              <p className="card-sub">Lottie breathing + ambient audio</p>
            </CardHeader>
            <CardContent>
              <div className="lottie-placeholder" role="img" aria-label="Breathing animation placeholder">
                <div className="breath-ring" />
                <div className="breath-text">Breathe in... out</div>
              </div>

              <div className="micro-actions">
                <Button onClick={() => alert('Start breathing animation')}>Start</Button>
                <Button variant="outline" onClick={() => alert('Play ambient audio')}>Play sound</Button>
              </div>
            </CardContent>
          </motion.section>

          <motion.section
            layout
            className="ya-card resources-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <p className="card-sub">Curated articles, helplines & videos</p>
            </CardHeader>
            <CardContent>
              <ul className="resource-list">
                <li><a href="#" onClick={(e) => e.preventDefault()}>Grounding exercise — 5 steps</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Sleep hygiene tips</a></li>
                <li><a href="#" onClick={(e) => e.preventDefault()}>Local helplines & emergency</a></li>
              </ul>
              <div className="resource-cta">
                <Button onClick={() => window.location.assign('/resources')}>Open Library</Button>
              </div>
            </CardContent>
          </motion.section>

          <motion.section
            layout
            className="ya-card diary-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            <CardHeader>
              <CardTitle>Personal Diary</CardTitle>
              <p className="card-sub">Private space to journal</p>
            </CardHeader>
            <CardContent>
              <textarea className="diary-input" placeholder="Write a quick reflection..."></textarea>
              <div className="diary-actions">
                <Button onClick={() => alert('Saved (demo)')}>Save</Button>
                <Button variant="ghost" onClick={() => alert('Export PDF (demo)')}>Export</Button>
              </div>
            </CardContent>
          </motion.section>

          <motion.section
            layout
            className="ya-card mood-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <CardHeader>
              <CardTitle>Mood Timeline</CardTitle>
              <p className="card-sub">Recent trends</p>
            </CardHeader>
            <CardContent>
              <div className="chart-placeholder">[Mood chart placeholder]</div>
            </CardContent>
          </motion.section>

          <motion.section
            layout
            className="ya-card crisis-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.3 }}
          >
            <CardHeader>
              <CardTitle>Crisis & Safety</CardTitle>
              <p className="card-sub">Immediate help & hotlines</p>
            </CardHeader>
            <CardContent>
              <div className="crisis-box">
                <div className="crisis-text">If you feel unsafe or are thinking of harming yourself, call your local emergency number immediately.</div>
                <div className="crisis-phones">
                  <div><strong>India:</strong> 112</div>
                  <div><strong>Global:</strong> See resources</div>
                </div>
                <div className="crisis-actions">
                  <Button onClick={() => alert('Call now (demo)')}>Call Now</Button>
                  <Button variant="destructive" onClick={() => alert('Crisis resources (demo)')}>Get Help</Button>
                </div>
              </div>
            </CardContent>
          </motion.section>

          <motion.section
            layout
            className="ya-card tasks-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          >
            <CardHeader>
              <CardTitle>Today&apos;s Mini Tasks</CardTitle>
              <p className="card-sub">Small actions to feel better</p>
            </CardHeader>
            <CardContent>
              <ul className="tasks-list">
                <li><input type="checkbox" /> 60s breathing</li>
                <li><input type="checkbox" /> Drink a glass of water</li>
                <li><input type="checkbox" /> 5-minute walk</li>
              </ul>
              <div className="tasks-cta">
                <Button onClick={() => alert('Mark all done (demo)')}>Complete</Button>
              </div>
            </CardContent>
          </motion.section>
        </section>
      </main>
    </div>
  );
}
