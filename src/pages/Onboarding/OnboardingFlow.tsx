import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Heart, Shield, Plus, X } from 'lucide-react';
import { Button } from '../../components/ui/Button/Button';
import { GlassCard } from '../../components/ui/Card/GlassCard';
import { Chip } from '../../components/ui/Chip/Chip';
import { ProgressBar } from '../../components/ui/ProgressBar/ProgressBar';
import { LifeStage, DiabetesType, Allergen, COMMON_ALLERGENS } from '../../types/profile';
import { useProfile } from '../../context/ProfileContext';

export interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { onboardingDraft, updateOnboardingDraft } = useProfile();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [customInput, setCustomInput] = useState('');

  // 1. Life Stage Toggle
  const toggleLifeStage = (stage: LifeStage) => {
    const current = onboardingDraft.lifeStages || [];
    if (current.includes(stage)) {
      updateOnboardingDraft({ lifeStages: current.filter((s) => s !== stage) });
    } else {
      updateOnboardingDraft({ lifeStages: [...current, stage] });
    }
  };

  // 2. Diabetes Select
  const setDiabetes = (type: DiabetesType) => {
    updateOnboardingDraft({ diabetesType: type });
  };

  // 3. Lactose Select
  const setLactose = (val: boolean) => {
    updateOnboardingDraft({ lactoseIntolerant: val });
  };

  // 4. Allergen Toggle
  const toggleAllergen = (id: Allergen) => {
    const current = onboardingDraft.allergies || [];
    if (current.includes(id)) {
      updateOnboardingDraft({ allergies: current.filter((a) => a !== id) });
    } else {
      updateOnboardingDraft({ allergies: [...current, id] });
    }
  };

  const addCustomAllergy = () => {
    if (!customInput.trim()) return;
    const current = onboardingDraft.customAllergies || [];
    if (!current.includes(customInput.trim())) {
      updateOnboardingDraft({ customAllergies: [...current, customInput.trim()] });
    }
    setCustomInput('');
  };

  const removeCustomAllergy = (name: string) => {
    const current = onboardingDraft.customAllergies || [];
    updateOnboardingDraft({ customAllergies: current.filter((c) => c !== name) });
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        padding: '24px 20px',
        maxWidth: '460px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
        {step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            style={{
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              marginRight: '12px',
            }}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-rose)', letterSpacing: '0.04em' }}>
          HEALTH PROFILE SETUP
        </span>
      </div>

      <ProgressBar currentStep={step} totalSteps={totalSteps} />

      <div style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          {/* STEP 1: LIFE STAGE */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="title-xl" style={{ marginBottom: '8px' }}>
                What describes your life stage?
              </h2>
              <p className="body-md" style={{ marginBottom: '24px' }}>
                Select all that apply. We tailor our hormone and glycemic limits accordingly.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <GlassCard
                  variant="interactive"
                  onClick={() => toggleLifeStage('pcos')}
                  style={{
                    borderColor: onboardingDraft.lifeStages?.includes('pcos')
                      ? 'var(--accent-rose)'
                      : 'var(--glass-border)',
                    background: onboardingDraft.lifeStages?.includes('pcos')
                      ? 'var(--accent-rose-soft)'
                      : 'var(--glass-bg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        🌸 PCOS / PCOD
                      </div>
                      <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Low-GI thresholds, strict sugar, and insulin sensitivity rules
                      </div>
                    </div>
                    {onboardingDraft.lifeStages?.includes('pcos') && <Check size={20} color="var(--accent-rose)" />}
                  </div>
                </GlassCard>

                <GlassCard
                  variant="interactive"
                  onClick={() => toggleLifeStage('pregnancy')}
                  style={{
                    borderColor: onboardingDraft.lifeStages?.includes('pregnancy')
                      ? 'var(--accent-rose)'
                      : 'var(--glass-border)',
                    background: onboardingDraft.lifeStages?.includes('pregnancy')
                      ? 'var(--accent-rose-soft)'
                      : 'var(--glass-bg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        🤰 Pregnancy
                      </div>
                      <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Caffeine, mercury fish, unpasteurized items, and sodium monitoring
                      </div>
                    </div>
                    {onboardingDraft.lifeStages?.includes('pregnancy') && <Check size={20} color="var(--accent-rose)" />}
                  </div>
                </GlassCard>

                <GlassCard
                  variant="interactive"
                  onClick={() => toggleLifeStage('breastfeeding')}
                  style={{
                    borderColor: onboardingDraft.lifeStages?.includes('breastfeeding')
                      ? 'var(--accent-rose)'
                      : 'var(--glass-border)',
                    background: onboardingDraft.lifeStages?.includes('breastfeeding')
                      ? 'var(--accent-rose-soft)'
                      : 'var(--glass-bg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        🤱 Breastfeeding
                      </div>
                      <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Milk supply herbs, alcohol elimination, and caffeine transfer check
                      </div>
                    </div>
                    {onboardingDraft.lifeStages?.includes('breastfeeding') && <Check size={20} color="var(--accent-rose)" />}
                  </div>
                </GlassCard>

                <GlassCard
                  variant="interactive"
                  onClick={() => updateOnboardingDraft({ lifeStages: [] })}
                  style={{
                    borderColor: onboardingDraft.lifeStages?.length === 0
                      ? 'var(--accent-lavender)'
                      : 'var(--glass-border)',
                    background: onboardingDraft.lifeStages?.length === 0
                      ? 'var(--accent-lavender-soft)'
                      : 'var(--glass-bg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ✨ None of these / General Wellness
                      </div>
                      <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Standard healthy eating guidelines and allergen defense
                      </div>
                    </div>
                    {onboardingDraft.lifeStages?.length === 0 && <Check size={20} color="var(--accent-lavender)" />}
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DIABETES */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="title-xl" style={{ marginBottom: '8px' }}>
                Do you have diabetes or insulin resistance?
              </h2>
              <p className="body-md" style={{ marginBottom: '24px' }}>
                Select your diagnosis to calibrate carbohydrate and glucose spike warnings.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {[
                  {
                    type: 'none' as DiabetesType,
                    title: 'No Diabetes',
                    desc: 'Standard healthy glycemic limits',
                  },
                  {
                    type: 'type1' as DiabetesType,
                    title: 'Type 1 Diabetes',
                    desc: 'Total carbs shown for insulin carb counting; alerts on added sugar & high-GI spikes',
                  },
                  {
                    type: 'type2' as DiabetesType,
                    title: 'Type 2 Diabetes',
                    desc: 'Strict carbohydrate, sugar, saturated fat, and sodium thresholds',
                  },
                ].map((item) => (
                  <GlassCard
                    key={item.type}
                    variant="interactive"
                    onClick={() => setDiabetes(item.type)}
                    style={{
                      borderColor: onboardingDraft.diabetesType === item.type
                        ? 'var(--accent-rose)'
                        : 'var(--glass-border)',
                      background: onboardingDraft.diabetesType === item.type
                        ? 'var(--accent-rose-soft)'
                        : 'var(--glass-bg)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.title}
                        </div>
                        <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {item.desc}
                        </div>
                      </div>
                      {onboardingDraft.diabetesType === item.type && <Check size={20} color="var(--accent-rose)" />}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3: LACTOSE */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="title-xl" style={{ marginBottom: '8px' }}>
                Are you lactose intolerant?
              </h2>
              <p className="body-md" style={{ marginBottom: '24px' }}>
                We separate lactose intolerance from milk allergies, applying graduated rules for low-lactose items like butter, ghee, and aged cheeses.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                <GlassCard
                  variant="interactive"
                  onClick={() => setLactose(true)}
                  style={{
                    borderColor: onboardingDraft.lactoseIntolerant ? 'var(--accent-rose)' : 'var(--glass-border)',
                    background: onboardingDraft.lactoseIntolerant ? 'var(--accent-rose-soft)' : 'var(--glass-bg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        🥛 Yes, I am Lactose Intolerant
                      </div>
                      <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Milk/whey/cream trigger red alerts; butter/ghee trigger caution notes
                      </div>
                    </div>
                    {onboardingDraft.lactoseIntolerant && <Check size={20} color="var(--accent-rose)" />}
                  </div>
                </GlassCard>

                <GlassCard
                  variant="interactive"
                  onClick={() => setLactose(false)}
                  style={{
                    borderColor: !onboardingDraft.lactoseIntolerant ? 'var(--accent-lavender)' : 'var(--glass-border)',
                    background: !onboardingDraft.lactoseIntolerant ? 'var(--accent-lavender-soft)' : 'var(--glass-bg)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        🧀 No, Dairy is Fine
                      </div>
                      <div className="caption" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                        I digest lactose without digestive distress
                      </div>
                    </div>
                    {!onboardingDraft.lactoseIntolerant && <Check size={20} color="var(--accent-lavender)" />}
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {/* STEP 4: ALLERGIES */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="title-xl" style={{ marginBottom: '8px' }}>
                Any food allergies?
              </h2>
              <p className="body-md" style={{ marginBottom: '20px' }}>
                An allergen match will <strong style={{ color: 'var(--verdict-red)' }}>instantly override</strong> the verdict to RED and display at the top.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                {COMMON_ALLERGENS.map((item) => {
                  const isSelected = onboardingDraft.allergies?.includes(item.id);
                  return (
                    <Chip
                      key={item.id}
                      label={`${item.icon} ${item.label}`}
                      selected={isSelected}
                      onClick={() => toggleAllergen(item.id)}
                    />
                  );
                })}
              </div>

              {/* Custom Other Allergens Field */}
              <div style={{ marginBottom: '32px' }}>
                <label className="caption" style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Other Specific Allergies or Sensitivities
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g. Mustard, Sulfites, Strawberries..."
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

                {onboardingDraft.customAllergies && onboardingDraft.customAllergies.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                    {onboardingDraft.customAllergies.map((name) => (
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
                        <X
                          size={14}
                          style={{ cursor: 'pointer' }}
                          onClick={() => removeCustomAllergy(name)}
                        />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 5: REVIEW */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="title-xl" style={{ marginBottom: '8px' }}>
                Review Your Health Profile
              </h2>
              <p className="body-md" style={{ marginBottom: '20px' }}>
                Here is how SHE Scan will evaluate products for you. You can update these anytime in your Profile.
              </p>

              <GlassCard padding="lg" style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <span className="caption" style={{ color: 'var(--text-muted)' }}>Life Stage</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {onboardingDraft.lifeStages && onboardingDraft.lifeStages.length > 0
                        ? onboardingDraft.lifeStages.map((s) => s.toUpperCase()).join(', ')
                        : 'General Wellness / None'}
                    </div>
                  </div>

                  <div>
                    <span className="caption" style={{ color: 'var(--text-muted)' }}>Diabetes Setting</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {onboardingDraft.diabetesType === 'type1'
                        ? 'Type 1 Diabetes (Carb Counting & High-GI Warning)'
                        : onboardingDraft.diabetesType === 'type2'
                        ? 'Type 2 Diabetes (Strict Sugar & Carb Limits)'
                        : 'None'}
                    </div>
                  </div>

                  <div>
                    <span className="caption" style={{ color: 'var(--text-muted)' }}>Lactose Intolerance</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {onboardingDraft.lactoseIntolerant ? 'Yes (Dairy Guard Active)' : 'No'}
                    </div>
                  </div>

                  <div>
                    <span className="caption" style={{ color: 'var(--text-muted)' }}>Recorded Allergens</span>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {[
                        ...(onboardingDraft.allergies || []),
                        ...(onboardingDraft.customAllergies || []),
                      ].join(', ') || 'None specified'}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Bar */}
      <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
        <Button variant="primary" size="lg" fullWidth onClick={nextStep} icon={<ArrowRight size={18} />}>
          {step === totalSteps ? 'Save & Create Account' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};
