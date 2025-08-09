'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import '../../styles/resources.css';

interface Resource {
  title: string;
  type: 'Article' | 'Video';
  category: string;
  link: string;
}

const resources: Resource[] = [
  { title: 'Mindfulness Guide', type: 'Article', category: 'Meditation', link: '#' },
  // Add more resources as needed
];

const ResourcesPage = () => {
  return (
    <div className="resources-page">
      <motion.div
        className="resources-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="resources-card">
          <CardHeader>
            <CardTitle>Resource Library</CardTitle>
          </CardHeader>
          <CardContent>
            {resources.map((resource, index) => (
              <motion.div
                key={index}
                className="resource-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <h3>{resource.title}</h3>
                <p>Type: {resource.type}</p>
                <p>Category: {resource.category}</p>
                <Button asChild>
                  <a href={resource.link} target="_blank" rel="noopener noreferrer">
                    View
                  </a>
                </Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResourcesPage;