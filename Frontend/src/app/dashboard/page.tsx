'use client';

import { useEffect, useState, useRef } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ThemeToggle } from '../components/theme-toggle';
import '../../styles/dashboard.css';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Bot, Book } from 'lucide-react';

// Define interface for assessment data
interface Assessment {
  type: 'PHQ-9' | 'GAD-7';
  score: number;
  severity: string;
  created_at?: string;
}

function EditableTasksCard() {
  const [tasks, setTasks] = useState([
    { id: 1, text: '60s breathing', completed: false },
    { id: 2, text: 'Drink a glass of water', completed: false },
    { id: 3, text: '5-minute walk', completed: false },
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const toggleComplete = (id: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const startEditing = (id: number) => setEditingId(id);

  const saveTaskText = (id: number, text: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, text: text.trim() || task.text } : task
      )
    );
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const clearAll = () => setTasks([]);

  const addTask = () => {
    const newId = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    setTasks([...tasks, { id: newId, text: 'New task', completed: false }]);
    setEditingId(newId);
  };

  return (
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

      <CardContent
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '280px',
        }}
      >
        <ul
          className="tasks-list"
          style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            paddingLeft: 0,
            margin: 0,
            listStyle: 'none',
          }}
        >
          {tasks.map(({ id, text, completed }) => (
            <li
              key={id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={completed}
                onChange={() => toggleComplete(id)}
                aria-label={`Mark task ${text} as completed`}
              />
              {editingId === id ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={(e) =>
                    setTasks((prev) =>
                      prev.map((task) =>
                        task.id === id ? { ...task, text: e.target.value } : task
                      )
                    )
                  }
                  onBlur={(e) => saveTaskText(id, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, id)}
                  style={{ flex: 1 }}
                />
              ) : (
                <span
                  onClick={() => startEditing(id)}
                  style={{
                    flex: 1,
                    textDecoration: completed ? 'line-through' : 'none',
                  }}
                >
                  {text}
                </span>
              )}
            </li>
          ))}
          {tasks.length === 0 && (
            <li style={{ textAlign: 'center', color: '#666', marginTop: '1rem' }}>
              No tasks. Add some!
            </li>
          )}
        </ul>

        <div
          className="tasks-cta"
          style={{
            marginTop: '1rem',
            flexShrink: 0,
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="outline" onClick={clearAll} disabled={tasks.length === 0}>
            Clear All
          </Button>
          <Button onClick={addTask}>Add Task</Button>
        </div>
      </CardContent>
    </motion.section>
  );
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
    { id: 'Quick Assessment', icon: '📝', href: '/assessmentlist' },
    { id: 'AI Chat', icon: '💬', href: '/ai' },
    { id: 'Meditation', icon: '🧘', href: '/meditation' },
    { id: 'Personal Diary', icon: '📔', href: '/diary' },
    { id: 'Resources', icon: '📚', href: '/resources' },
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
                <strong>{user?.firstName}</strong>

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
                <Button onClick={() => window.location.assign('/meditation')}>Do a 2-min breathing</Button>
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
            className="ya-card meditation-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <Card className="max-w-md mx-auto text-center p-4">
              {/* Heading */}
              <h2 className="text-2xl font-bold mb-2">Meditation</h2>

              {/* Lottie / Animation Placeholder */}
              <div
                className="lottie-placeholder mb-4"
                role="img"
                aria-label="Breathing animation placeholder"
              >

                <div className="breath-ring" />
                <br />
                <div className="breath-text">Breathe in... out</div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4">
                Practice your meditation now with deep breathing and mindful focus.
              </p>

              {/* Start Meditation Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={() => window.location.assign('/meditation')}
              >
                Begin Meditation
              </Button>
            </Card>
          </motion.section>

          <motion.section
            layout
            className="ya-card resources-card"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <CardHeader style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Book className="book-icon" size={24} />
              <div>
                <CardTitle>Resources</CardTitle>
                <p className="card-sub">Curated articles, helplines & videos</p>
              </div>
            </CardHeader>

            <CardContent>
              <div className="resource-detail-text" style={{ marginBottom: "1rem" }}>
                Articles and resources to support your wellness journey.
              </div>

              <div className="resource-cta">
                <Button onClick={() => window.location.assign('/resources')}>
                  Open Library
                </Button>
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
                <div className="crisis-text">
                  If you feel unsafe or are thinking of harming yourself, call your local emergency number immediately.
                </div>
                <div className="crisis-phones">
                  <div><strong>India:</strong> 112</div>
                  <div><strong>Global:</strong> See resources</div>
                </div>
                <div className="crisis-actions">
                  <Button
                    onClick={() => {
                      window.location.href = 'tel:112';
                    }}
                  >
                    Call Now
                  </Button>

                  <Button
                    onClick={() => router.push('/resources/crisis-help')}
                  >
                    Get Help
                  </Button>
                </div>
              </div>
            </CardContent>
          </motion.section>

          {/* New Editable Tasks Card */}
          <EditableTasksCard />
        </section>
      </main>
    </div>
  );
}
