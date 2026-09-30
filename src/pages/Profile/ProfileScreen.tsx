import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Trash2, LogOut, Check, Plus, X, Lock, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { GlassCard } from '../../components/ui/Card/GlassCard';
import { Chip } from '../../components/ui/Chip/Chip';
import { Modal } from '../../components/ui/Modal/Modal';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';
import { LifeStage, DiabetesType, Allergen, COMMON_ALLERGENS } from '../../types/profile';

export const ProfileScreen: React.FC = () => {
  const { profile, updateProfile, deleteAccount } = useProfile();
  const { user, isAnonymous, upgradeAccount, signOut } = useAuth();

  // Local state for editing
  const [lifeStages, setLifeStages] = useState<LifeStage[]>(profile?.lifeStages || []);
  const [diabetesType, setDiabetesType] = useState<DiabetesType>(profile?.diabetesType || 'none');
  const [lactoseIntolerant, setLactoseIntolerant] = useState<boolean>(profile?.lactoseIntolerant || false);
  const [allergies, setAllergies] = useState<Allergen[]>(profile?.allergies || []);
  const [customAllergies, setCustomAllergies] = useState<string[]>(profile?.customAllergies || []);
  const [customInput, setCustomInput] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Upgrade Modal
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeEmail, setUpgradeEmail] = useState('');
  const [upgradePassword, setUpgradePassword] = useState('');
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  // Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Life Stage Toggle
  const toggleLifeStage = (stage: LifeStage) => {
    if (lifeStages.includes(stage)) {
      setLifeStages(lifeStages.filter((s) => s !== stage));
    } else {
      setLifeStages([...lifeStages, stage]);
    }
  };

  // Allergen Toggle
  const toggleAllergen = (id: Allergen) => {
    if (allergies.includes(id)) {
      setAllergies(allergies.filter((a) => a !== id));
    } else {
      setAllergies([...allergies, id]);
    }
  };

  const addCustomAllergy = () => {
    if (!customInput.trim()) return;
    if (!customAllergies.includes(customInput.trim())) {
      setCustomAllergies([...customAllergies, customInput.trim()]);
    }
    setCustomInput('');
  };

  const removeCustomAllergy = (name: string) => {
    setCustomAllergies(customAllergies.filter((c) => c !== name));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const success = await updateProfile({
      lifeStages,
      diabetesType,
      lactoseIntolerant,
      allergies,
      customAllergies,
    });

    setIsSaving(false);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleUpgradeAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpgradeError(null);
    const { error } = await upgradeAccount(upgradeEmail, upgradePassword);
    if (error) {
      setUpgradeError(error.message || 'Failed to link account.');
    } else {
      setUpgradeModalOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    await deleteAccount();
    setIsDeleting(false);
    setDeleteModalOpen(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 20px 48px',
        maxWidth: '480px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h1 className="title-xl" style={{ marginBottom: '4px' }}>
          Health Profile
        </h1>
        <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
          Manage the personal health parameters SHE Scan uses to evaluate foods.
        </p>
      </div>

      {/* Account Info Card */}
      <GlassCard padding="md" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--accent-rose-soft)',
                border: '1px solid var(--accent-rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-rose)',
              }}
            >
              <User size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>
                {profile?.displayName || 'Health Explorer'}
              </div>
              <div className="caption" style={{ color: 'var(--text-muted)' }}>
                {isAnonymous ? 'Guest Account (Unlinked)' : user?.email || 'Saved Account'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={signOut}
            title="Sign out"
            style={{
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
            }}
          >
            <LogOut size={18} />
          </button>
        </div>

        {isAnonymous && (
          <div
            style={{
              marginTop: '14px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span className="caption" style={{ color: 'var(--accent-lavender)' }}>
              🔒 Upgrade to sync across devices
            </span>
            <Button variant="outline" size="sm" onClick={() => setUpgradeModalOpen(true)}>
              Link Email
            </Button>
          </div>
        )}
      </GlassCard>

      {/* Section: Life Stages */}
      <div style={{ marginBottom: '22px' }}>
        <h3 className="title-md" style={{ marginBottom: '10px' }}>
          Life Stage Conditions
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Chip
            label="🌸 PCOS / PCOD"
            selected={lifeStages.includes('pcos')}
            onClick={() => toggleLifeStage('pcos')}
          />
          <Chip
            label="🤰 Pregnancy"
            selected={lifeStages.includes('pregnancy')}
            onClick={() => toggleLifeStage('pregnancy')}
          />
          <Chip
            label="🤱 Breastfeeding"
            selected={lifeStages.includes('breastfeeding')}
            onClick={() => toggleLifeStage('breastfeeding')}
          />
        </div>
      </div>

      {/* Section: Diabetes */}
      <div style={{ marginBottom: '22px' }}>
        <h3 className="title-md" style={{ marginBottom: '10px' }}>
          Diabetes / Glycemic Protocol
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <Chip
            label="None"
            selected={diabetesType === 'none'}
            onClick={() => setDiabetesType('none')}
          />
          <Chip
            label="Type 1 Diabetes"
            selected={diabetesType === 'type1'}
            onClick={() => setDiabetesType('type1')}
          />
          <Chip
            label="Type 2 Diabetes"
            selected={diabetesType === 'type2'}
            onClick={() => setDiabetesType('type2')}
          />
        </div>
      </div>

      {/* Section: Lactose Intolerance */}
      <div style={{ marginBottom: '22px' }}>
        <h3 className="title-md" style={{ marginBottom: '10px' }}>
          Lactose Sensitivity
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Chip
            label="🥛 Lactose Intolerant (Active)"
            selected={lactoseIntolerant}
            onClick={() => setLactoseIntolerant(true)}
          />
          <Chip
            label="🧀 Dairy Digestible"
            selected={!lactoseIntolerant}
            onClick={() => setLactoseIntolerant(false)}
          />
        </div>
      </div>

      {/* Section: Food Allergies */}
      <div style={{ marginBottom: '28px' }}>
        <h3 className="title-md" style={{ marginBottom: '10px' }}>
          Food Allergens (Instant Red Override)
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          {COMMON_ALLERGENS.map((item) => (
            <Chip
              key={item.id}
              label={`${item.icon} ${item.label}`}
              selected={allergies.includes(item.id)}
              onClick={() => toggleAllergen(item.id)}
            />
          ))}
        </div>

        {/* Custom allergies */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Add custom allergen..."
            className="glass-input"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomAllergy();
              }
            }}
          />
          <Button variant="secondary" onClick={addCustomAllergy} icon={<Plus size={18} />}>
            Add
          </Button>
        </div>

        {customAllergies.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {customAllergies.map((name) => (
              <span
                key={name}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(232, 143, 167, 0.15)',
                  border: '1px solid var(--accent-rose)',
                  color: '#ffffff',
                  fontSize: '12px',
                }}
              >
                <span>{name}</span>
                <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeCustomAllergy(name)} />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div style={{ marginBottom: '32px' }}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSave}
          isLoading={isSaving}
          icon={saveSuccess ? <Check size={20} /> : undefined}
        >
          {saveSuccess ? 'Changes Saved!' : 'Save Profile Changes'}
        </Button>
      </div>

      {/* Danger Zone: Delete Account */}
      <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h4 className="title-md" style={{ color: 'var(--verdict-red)', fontSize: '15px', marginBottom: '6px' }}>
          Danger Zone
        </h4>
        <p className="caption" style={{ color: 'var(--text-muted)', marginBottom: '14px' }}>
          Permanently delete your account, health profile, and all saved scan history.
        </p>

        <Button
          variant="danger"
          size="sm"
          onClick={() => setDeleteModalOpen(true)}
          icon={<Trash2 size={16} />}
        >
          Delete My Account & Data
        </Button>
      </div>

      {/* Upgrade Anonymous Account Modal */}
      <Modal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Link Account & Keep Your Data"
      >
        <form onSubmit={handleUpgradeAccount} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p className="body-md" style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
            Enter an email and password to secure your account and access your scan history across phones.
          </p>

          <input
            type="email"
            value={upgradeEmail}
            onChange={(e) => setUpgradeEmail(e.target.value)}
            placeholder="Email address"
            className="glass-input"
            required
          />
          <input
            type="password"
            value={upgradePassword}
            onChange={(e) => setUpgradePassword(e.target.value)}
            placeholder="Choose password"
            className="glass-input"
            required
          />

          {upgradeError && (
            <p className="caption" style={{ color: 'var(--verdict-red)' }}>
              {upgradeError}
            </p>
          )}

          <Button variant="primary" type="submit" fullWidth>
            Save & Link Email
          </Button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Account & All Data?"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p className="body-md" style={{ color: 'var(--text-secondary)' }}>
            This action is irreversible. All your recorded conditions, dietary preferences, and scan history will be permanently wiped from the database.
          </p>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="danger" fullWidth onClick={handleDeleteAccount} isLoading={isDeleting}>
              Yes, Delete Everything
            </Button>
            <Button variant="secondary" fullWidth onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
