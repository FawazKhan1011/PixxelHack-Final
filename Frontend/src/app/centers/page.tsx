'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import '../../styles/centers.css';

const centers = [
  { name: 'MindPeace Clinic', distance: '2 km', specialization: 'Therapy', rating: 4.5 },
  // Add more centers
];

const CentersPage = () => {


  return (
    <div className="centers-page">
      <motion.div
        className="centers-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="centers-card">
          <CardHeader>
            <CardTitle>Nearby Mental Health Centers</CardTitle>
          </CardHeader>
          <CardContent>
            {centers.map((center, index) => (
              <motion.div
                key={index}
                className="center-item"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <h3>{center.name}</h3>
                <p>Distance: {center.distance}</p>
                <p>Specialization: {center.specialization}</p>
                <p>Rating: {center.rating} ★</p>
                <Button>Call</Button>
                <Button>Directions</Button>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CentersPage;