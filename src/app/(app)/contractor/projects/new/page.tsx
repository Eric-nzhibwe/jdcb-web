'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAllClients, createProject } from '@/services/projects';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toDateInputValue } from '@/lib/utils';

export default function ContractorNewProjectPage() {
  const { user } = useAuth();
  const router   = useRouter();

  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [location,    setLocation]    = useState('');
  const [startDate,   setStartDate]   = useState(toDateInputValue());
  const [endDate,     setEndDate]     = useState('');
  const [budget,      setBudget]      = useState('');
  const [clientId,    setClientId]    = useState('');
  const [clients,     setClients]     = useState<{ id: string; displayName: string; email: string }[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  useEffect(() => { getAllClients().then(setClients).catch(console.error); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim() || !location.trim() || !clientId) {
      setError('Please fill in all required fields and select a client.');
      return;
    }
    const client = clients.find((c) => c.id === clientId);
    if (!client) { setError('Select a client.'); return; }
    setLoading(true); setError('');
    try {
      const project = await createProject({
        name: name.trim(), description: description.trim(),
        clientId: client.id, clientName: client.displayName,
        contractorId: user.id, contractorName: user.displayName,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        location: location.trim(),
        budget: budget ? parseFloat(budget) : undefined,
      });
      router.replace(`/contractor/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">New Project</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Create a fabrication project</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4 shadow-card">
          <h2 className="font-bold text-gray-900 dark:text-white">Project Details</h2>
          <Input label="Project Name *" value={name} onChange={(e) => setName(e.target.value)} placeholder="Steel Frame Build" />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Project details..." />
          <Input label="Location *" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="123 Industrial Ave" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <Input label="Budget (K)" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="50000" />

          {clients.length > 0 ? (
            <Select
              label="Client *"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Select a client"
              options={clients.map((c) => ({ value: c.id, label: `${c.displayName} (${c.email})` }))}
            />
          ) : (
            <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
              No clients registered yet. A client needs to sign up first.
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={loading}>Create Project</Button>
        </div>
      </form>
    </div>
  );
}
