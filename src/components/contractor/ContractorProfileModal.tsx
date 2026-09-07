'use client';

import { Mail, Phone, Building2, User, CheckCircle, Star } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getInitials } from '@/lib/utils';
import type { ContractorSummary } from '@/services/projects';

interface ContractorProfileModalProps {
  contractor: ContractorSummary | null;
  open: boolean;
  onClose: () => void;
  onSelect?: (contractor: ContractorSummary) => void;
  isSelected?: boolean;
}

export function ContractorProfileModal({
  contractor,
  open,
  onClose,
  onSelect,
  isSelected,
}: ContractorProfileModalProps) {
  if (!contractor) return null;

  const initials = getInitials(contractor.displayName);

  return (
    <Modal open={open} onClose={onClose} title="Contractor Profile" className="max-w-md">
      <div className="space-y-6">
        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center gap-3 pt-2">
          {contractor.photoURL ? (
            <img
              src={contractor.photoURL}
              alt={contractor.displayName}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-primary/20"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center ring-4 ring-primary/20">
              <span className="text-3xl font-black text-white">{initials}</span>
            </div>
          )}
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{contractor.displayName}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full mt-1">
              <Star className="w-3 h-3" /> Contractor
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl divide-y divide-gray-100 dark:divide-gray-700">
          {contractor.email && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{contractor.email}</p>
              </div>
            </div>
          )}

          {contractor.phone ? (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone</p>
                <a href={`tel:${contractor.phone}`} className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline">
                  {contractor.phone}
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 opacity-50">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Phone</p>
                <p className="text-sm text-gray-400">Not provided</p>
              </div>
            </div>
          )}

          {contractor.company ? (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Company</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{contractor.company}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 opacity-50">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Company</p>
                <p className="text-sm text-gray-400">Independent contractor</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Role</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">Weld & Fab Contractor</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {contractor.phone && (
            <a
              href={`tel:${contractor.phone}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-xl text-sm font-semibold hover:bg-green-100 transition-colors"
            >
              <Phone className="w-4 h-4" /> Call
            </a>
          )}
          {onSelect && (
            <Button
              className="flex-1"
              onClick={() => { onSelect(contractor); onClose(); }}
              variant={isSelected ? 'outline' : 'primary'}
            >
              {isSelected ? (
                <><CheckCircle className="w-4 h-4" /> Selected</>
              ) : (
                'Select Contractor'
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
