import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Spinner } from '../components/ui/spinner';
import api from '../lib/api';

export default function Montage() {
  const [montages, setMontages] = useState([]);
  const [selectedMontage, setSelectedMontage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchMontages = async () => {
      try {
        const response = await api.get('/montages');
        setMontages(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedMontage(response.data.data[0]);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch montages.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMontages();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Reminiss</h1>
          </div>
          <Button asChild size="sm">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Memory Montage</h2>
          <p className="text-muted-foreground">
            View your batch's memories in a visual format
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
            <h2 className="mb-2 text-xl font-semibold text-destructive">Error</h2>
            <p className="mb-4">{error}</p>
          </div>
        ) : montages.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <h4 className="mb-2 text-lg font-medium">No montages available</h4>
            <p className="mb-4 text-muted-foreground">
              Your batch doesn't have any montages yet. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid gap-8">
            <div className="flex flex-wrap gap-4">
              {montages.map((montage: any) => (
                <Button
                  key={montage._id}
                  onClick={() => setSelectedMontage(montage)}
                  variant={selectedMontage?._id === montage._id ? "default" : "outline"}
                >
                  {montage.title}
                </Button>
              ))}
            </div>

            {selectedMontage && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedMontage.title}</CardTitle>
                  <CardDescription>
                    Created on{' '}
                    {new Date(selectedMontage.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {selectedMontage.entries.map((entry: any) => (
                      <Link
                        key={entry._id}
                        to={`/entries/${entry._id}`}
                        className="group block overflow-hidden rounded-lg border bg-card transition-all hover:shadow-md"
                      >
                        <div className="p-4">
                          <h3 className="line-clamp-1 text-lg font-semibold group-hover:text-primary">
                            {entry.title}
                          </h3>
                          <p className="line-clamp-3 mt-2 text-sm text-muted-foreground">
                            {entry.content}
                          </p>
                          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{entry.user.name}</span>
                            <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 