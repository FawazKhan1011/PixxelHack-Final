'use client';

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import "../../../styles/resources.css";  // Make sure this path and file exist

const crisisHotlines = [
  {
    country: "India",
    number: "112",
    description: "National Emergency Number - immediate assistance",
  },
  {
    country: "USA",
    number: "988",
    description: "National Suicide Prevention Lifeline",
  },
  {
    country: "UK",
    number: "999",
    description: "Emergency Number",
  },
  {
    country: "Australia",
    number: "000",
    description: "Emergency Assistance",
  },
  {
    country: "Canada",
    number: "911",
    description: "Emergency Services",
  },
  {
    country: "Global",
    number: "",
    description: "Visit https://www.iasp.info/resources/Crisis_Centres/ for international hotlines",
    url: "https://www.iasp.info/resources/Crisis_Centres/",
  },
];

const CrisisHelpPage = () => {
  const router = useRouter();  // Correct hook usage inside component

  return (
    <main className="resources-page">
      <motion.section
        layout
        className="resources-header"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Crisis & Safety Resources</h1>
        <p>Your guide to immediate help and mental health support hotlines</p>
      </motion.section>

      <section className="resources-list crisis-list">
        {crisisHotlines.map(({ country, number, description, url }, i) => (
          <motion.div
            key={i}
            layout
            className="resource-card crisis-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{country}</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{description}</p>
                {number && (
                  <p>
                    <strong>Hotline:</strong>{" "}
                    <a href={`tel:${number}`} className="resource-link">
                      {number}
                    </a>
                  </p>
                )}
                {url && (
                  <p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-link"
                    >
                      Visit Website
                    </a>
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </section>

      <section className="resources-cta crisis-cta">
        <Button onClick={() => router.push('/dashboard')} variant="outline">
          Back to Dashboard
        </Button>
      </section>
    </main>
  );
};

export default CrisisHelpPage;
