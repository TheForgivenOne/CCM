'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';

interface ReinvestmentRule {
  id: string;
  name: string;
  threshold: number;
  target: string;
  enabled: boolean;
}

interface SettingsData {
  company_name?: string;
  income_categories: string[];
  expense_categories: string[];
  savings_target: number;
  warning_threshold: number;
  reinvestment_rules: ReinvestmentRule[];
}

const defaultIncomeCategories = ['Salary', 'Freelance', 'Investments', 'Other Income'];
const defaultExpenseCategories = ['Rent', 'Utilities', 'Food', 'Transport', 'Entertainment', 'Shopping', 'Health', 'Other'];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    company_name: '',
    income_categories: defaultIncomeCategories,
    expense_categories: defaultExpenseCategories,
    savings_target: 0,
    warning_threshold: 0,
    reinvestment_rules: [],
  });
  const [incomeInput, setIncomeInput] = useState('');
  const [expenseInput, setExpenseInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    threshold: 0,
    target: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        setSettings({
          company_name: data.company_name || '',
          income_categories: data.settings?.income_categories || defaultIncomeCategories,
          expense_categories: data.settings?.expense_categories || defaultExpenseCategories,
          savings_target: data.settings?.savings_target || 0,
          warning_threshold: data.settings?.warning_threshold || 0,
          reinvestment_rules: data.settings?.reinvestment_rules || [],
        });
        
        setIncomeInput((data.settings?.income_categories || defaultIncomeCategories).join(', '));
        setExpenseInput((data.settings?.expense_categories || defaultExpenseCategories).join(', '));
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      const incomeCats = incomeInput.split(',').map(c => c.trim()).filter(c => c);
      const expenseCats = expenseInput.split(',').map(c => c.trim()).filter(c => c);

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          companyName: settings.company_name,
          incomeCategories: incomeCats,
          expenseCategories: expenseCats,
          savingsTarget: settings.savings_target,
          warningThreshold: settings.warning_threshold,
          reinvestmentRules: settings.reinvestment_rules,
        })
      });

      if (!res.ok) throw new Error('Failed to save settings');

      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRule = () => {
    if (!newRule.name || !newRule.target) return;
    
    const rule: ReinvestmentRule = {
      id: Date.now().toString(),
      name: newRule.name,
      threshold: newRule.threshold,
      target: newRule.target,
      enabled: true,
    };
    
    setSettings({
      ...settings,
      reinvestment_rules: [...settings.reinvestment_rules, rule],
    });
    
    setNewRule({ name: '', threshold: 0, target: '' });
    setIsModalOpen(false);
  };

  const handleDeleteRule = (id: string) => {
    setSettings({
      ...settings,
      reinvestment_rules: settings.reinvestment_rules.filter(r => r.id !== id),
    });
  };

  const handleToggleRule = (id: string) => {
    setSettings({
      ...settings,
      reinvestment_rules: settings.reinvestment_rules.map(r => 
        r.id === id ? { ...r, enabled: !r.enabled } : r
      ),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-heading text-zinc-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Configure your accounting flow
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <h2 className="text-lg font-heading text-zinc-900 dark:text-white mb-4">
            Business Profile
          </h2>
          <div className="space-y-4">
            <Input
              label="Company Name"
              value={settings.company_name || ''}
              onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
              placeholder="Your Business Name"
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-heading text-zinc-900 dark:text-white mb-4">
            Income Categories
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
            Separate categories with commas
          </p>
          <Input
            value={incomeInput}
            onChange={(e) => setIncomeInput(e.target.value)}
            placeholder="Salary, Freelance, Investments, Other Income"
          />
        </Card>

        <Card>
          <h2 className="text-lg font-heading text-zinc-900 dark:text-white mb-4">
            Expense Categories
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
            Separate categories with commas
          </p>
          <Input
            value={expenseInput}
            onChange={(e) => setExpenseInput(e.target.value)}
            placeholder="Rent, Utilities, Food, Transport, Entertainment"
          />
        </Card>

        <Card>
          <h2 className="text-lg font-heading text-zinc-900 dark:text-white mb-4">
            Financial Goals
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Savings Target ($)"
              type="number"
              min="0"
              step="0.01"
              value={settings.savings_target || ''}
              onChange={(e) => setSettings({ ...settings, savings_target: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
            <Input
              label="Warning Threshold ($)"
              type="number"
              min="0"
              step="0.01"
              value={settings.warning_threshold || ''}
              onChange={(e) => setSettings({ ...settings, warning_threshold: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Get warned when your balance drops below the threshold
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading text-zinc-900 dark:text-white">
              Reinvestment Rules
            </h2>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              Add Rule
            </Button>
          </div>
          
          {settings.reinvestment_rules.length === 0 ? (
            <p className="text-zinc-400 text-sm py-4">
              No reinvestment rules configured. Add a rule to automatically reinvest surplus cash.
            </p>
          ) : (
            <div className="space-y-3">
              {settings.reinvestment_rules.map((rule) => (
                <div 
                  key={rule.id}
                  className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        rule.enabled ? 'bg-[#10B981]' : 'bg-zinc-300 dark:bg-zinc-700'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        rule.enabled ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </button>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {rule.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        When balance exceeds ${rule.threshold} → {rule.target}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 text-zinc-400 hover:text-[#F43F5E] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
          {message && (
            <span className={message.includes('Failed') ? 'text-[#F43F5E]' : 'text-[#10B981]'}>
              {message}
            </span>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Reinvestment Rule"
      >
        <div className="space-y-4">
          <Input
            label="Rule Name"
            value={newRule.name}
            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
            placeholder="e.g., Emergency Fund"
          />
          <Input
            label="Balance Threshold ($)"
            type="number"
            min="0"
            step="0.01"
            value={newRule.threshold || ''}
            onChange={(e) => setNewRule({ ...newRule, threshold: parseFloat(e.target.value) || 0 })}
            placeholder="e.g., 5000"
          />
          <Input
            label="Target"
            value={newRule.target}
            onChange={(e) => setNewRule({ ...newRule, target: e.target.value })}
            placeholder="e.g., High Yield Savings"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleAddRule}>
              Add Rule
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
