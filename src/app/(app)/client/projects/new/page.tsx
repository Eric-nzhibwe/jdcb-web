'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllContractors, createProject } from '@/services/projects';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toDateInputValue, getInitials } from '@/lib/utils';

type Contractor = { id: string; displayName: string; email: string; phone?: string; company?: string };

export default function ClientNewProjectPage() {
  const { user } = useAuth();
  const router   = useRouter();

  const [name,         setName]         = useState('');
  const [description,  setDescription]  = useState('');
  const [location,     setLocation]     = useState('');
  const [startDate,    setStartDate]    = useState(toDateInputValue());
  const [endDate,      setEndDate]      = useState('');
  const [budget,       setBudget]       = useState('');
  const [contractorId, setContractorId] = useState('');
  const [contractors,  setContractors]  = useState<Contractor[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  useEffect(() => { getAllContractors().then(setContractors).catch(console.error); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim() || !location.trim() || !contractorId) {
      setError('Please fill in all required fields and select a contractor.');
      return;
    }
    const contractor = contractors.find((c) => c.id === contractorId);
    if (!contractor) { setError('Select a contractor.'); return; }
    setLoading(true); setError('');
    try {
      const project = await createProject({
        name: name.trim(), description: description.trim(),
        clientId: user.id, clientName: user.displayName,
        contractorId: contractor.id, contractorName: contractor.displayName,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        location: location.trim(),
        budget: budget ? parseFloat(budget) : undefined,
      });
      router.replace(`/client/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">New Project</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Create and assign a fabrication project</p>
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
        </div>

        {/* Contractor selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-card">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Assign Contractor *</h2>
          {contractors.length === 0 ? (
            <p className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
              No contractors registered yet. A contractor needs to sign up first.
            </p>
          ) : (
            <div className="space-y-2">
              {contractors.map((c) => {
                const selected = contractorId === c.id;
                const initials = getInitials(c.displayName);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setContractorId(c.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                      selected ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <span className={`text-sm font-black ${selected ? 'text-white' : 'text-primary'}`}>{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.displayName}</p>
                      {c.company && <p className="text-xs text-gray-500 dark:text-gray-400">{c.company}</p>}
                      <p className="text-xs text-gray-400">{c.email}</p>
                      {c.phone && (
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />{c.phone}
                        </p>
                      )}
                    </div>
                    {selected && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={loading}>
            {contractorId ? `Assign Project` : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
}
