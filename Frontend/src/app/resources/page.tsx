'use client';

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "../../styles/resources.css";

const articles = [
  {
    id: 1,
    title: "Grounding Exercise — 5 Steps",
    description:
      "Learn simple grounding techniques to reduce anxiety and stay present.",
    url: "https://www.healthline.com/health/grounding-techniques",
  },
  {
    id: 2,
    title: "Sleep Hygiene Tips",
    description:
      "Improve your sleep quality with these practical tips and habits.",
    url: "https://www.sleepfoundation.org/sleep-hygiene",
  },
  {
    id: 3,
    title: "Stress Management Techniques",
    description:
      "Effective strategies to manage and reduce stress in daily life.",
    url: "https://www.apa.org/topics/stress/tips",
  },
  {
    id: 4,
    title: "Mindfulness for Beginners",
    description:
      "A beginner’s guide to mindfulness meditation and its benefits.",
    url: "https://www.mindful.org/mindfulness-how-to-do-it/",
  },
  {
    id: 5,
    title: "Building Healthy Habits",
    description:
      "Steps to create and maintain habits that support your well-being.",
    url: "https://jamesclear.com/habits",
  },
];

const videos = [
  {
    id: 1,
    title: "Mindfulness Meditation for Beginners",
    embedUrl: "https://www.youtube.com/embed/inpok4MKVLM",
  },
  {
    id: 2,
    title: "5-Minute Breathing Exercise for Anxiety Relief",
    embedUrl: "https://www.youtube.com/embed/odADwWzHR24",
  },
  {
    id: 3,
    title: "Guided Body Scan Meditation for Relaxation",
    embedUrl: "https://www.youtube.com/embed/sTpo1FuYQ9I",
  },
  {
    id: 4,
    title: "Progressive Muscle Relaxation Guided Meditation",
    embedUrl: "https://www.youtube.com/embed/1nZEdqcGVzo",
  },
  {
    id: 5,
    title: "Understanding Stress and How to Manage It",
    embedUrl: "https://www.youtube.com/embed/sTpo1FuYQ9I",
  },
];

const ResourcesPage = () => {
  return (
    <main className="resources-page">
      <motion.section
        layout
        className="resources-header"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Resources Library</h1>
        <p>Your curated collection of wellness articles and videos</p>
      </motion.section>

      <section className="resources-list">
        <h2>Articles</h2>
        {articles.map(({ id, title, description, url }) => (
          <motion.div
            key={id}
            layout
            className="resource-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: id * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{description}</p>
                <a href={url} target="_blank" rel="noopener noreferrer" className="resource-link">
                  Read More
                </a>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="resources-list">
        <h2>Videos</h2>
        {videos.map(({ id, title, embedUrl }) => (
          <motion.div
            key={id}
            layout
            className="resource-card video-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: id * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="video-wrapper">
                  <iframe
                    src={embedUrl}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>
    </main>
  );
};

export default ResourcesPage;
