import React, { useState } from 'react';
import { useOnboardingStore } from '../../../stores/onboardingStore';
import { MaritalStatus, CalcScope } from '../../../types/onboarding';
import { calculateAge, calculateBirthYear } from '../../../utils/onboardingValidation';
import { Users, Heart, Baby, User, Calendar, Calculator, Info, AlertCircle, Settings } from 'lucide-react';
import EnhancedTooltip from '../../ui/enhanced-tooltip';
import { getSparerPauschbetrag } from '../../../utils/taxHelpers';

const PersonalDataStep: React.FC = () => {
  const { data, updateData, updateTaxSettings } = useOnboardingStore();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validationMessages, setValidationMessages] = useState<Record<string, string>>({});
  const [showTaxSettings, setShowTaxSettings] = useState(false);
  
  const personal = data.personal || {
    birthYear: 0,
    age: 0,
    maritalStatus: 'ledig' as MaritalStatus,
    children: { has: false }
  };

  const handleBirthYearChange = (birthYear: number) => {
    const age = calculateAge(birthYear);
    updateData({
      personal: {
        ...personal,
        birthYear,
        age
      }
    });
    validateField('birthYear', birthYear);
  };

  const handleAgeChange = (age: number) => {
    const birthYear = calculateBirthYear(age);
    updateData({
      personal: {
        ...personal,
        age,
        birthYear
      }
    });
    validateField('age', age);
  };

  const validateField = (field: string, value: string | number) => {
    let message = '';
    
    switch (field) {
      case 'birthYear':
        const year = Number(value);
        const currentYear = new Date().getFullYear();
        if (year < 1920 || year > currentYear - 18) {
          message = 'Bitte geben Sie ein gültiges Geburtsjahr ein (1920-' + (currentYear - 18) + ')';
        }
        break;
      case 'age':
        const age = Number(value);
        if (age < 18 || age > 100) {
          message = 'Das Alter muss zwischen 18 und 100 Jahren liegen';
        }
        break;
    }
    
    setValidationMessages(prev => ({ ...prev, [field]: message }));
  };

  const handleMaritalStatusChange = (maritalStatus: MaritalStatus) => {
    const updatedPersonal = {
      ...personal,
      maritalStatus
    };
    
    // Reset calcScope if not married
    if (maritalStatus !== 'verheiratet') {
      delete updatedPersonal.calcScope;
    }
    
    updateData({ personal: updatedPersonal });
  };

  const handleCalcScopeChange = (calcScope: CalcScope) => {
    updateData({
      personal: {
        ...personal,
        calcScope
      }
    });
  };

  const handleChildrenChange = (has: boolean, count?: number) => {
    updateData({
      personal: {
        ...personal,
        children: {
          has,
          count: has ? (count || 0) : undefined
        }
      }
    });
  };

  const maritalStatusOptions: { value: MaritalStatus; label: string }[] = [
    { value: 'ledig', label: 'Ledig' },
    { value: 'verheiratet', label: 'Verheiratet' },
    { value: 'geschieden', label: 'Geschieden' },
    { value: 'dauernd_getrennt', label: 'Dauernd getrennt lebend' },
    { value: 'verwitwet', label: 'Verwitwet' }
  ];

  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'birthYear':
      case 'age':
        return <Calendar className="w-5 h-5" />;
      case 'maritalStatus':
        return <Heart className="w-5 h-5" />;
      case 'calculationScope':
        return <Calculator className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Persönliche Daten
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Bitte geben Sie Ihre grundlegenden persönlichen Informationen ein, um eine präzise Rentenberechnung zu ermöglichen.
        </p>
      </div>

      {/* Age and Birth Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`transition-all duration-300 ${focusedField === 'birthYear' ? 'transform scale-105' : ''}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Geburtsjahr *
            <EnhancedTooltip
              content="Ihr Geburtsjahr wird für die Berechnung der altersabhängigen Rentenbeiträge und Steuervorteile benötigt."
              position="top"
            >
              <Info className="w-4 h-4 text-gray-400 hover:text-blue-500 cursor-help" />
            </EnhancedTooltip>
          </label>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={personal.birthYear === 0 ? '' : personal.birthYear}
            onChange={(e) => handleBirthYearChange(parseInt(e.target.value) || 0)}
            onFocus={() => setFocusedField('birthYear')}
            onBlur={() => setFocusedField(null)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
              validationMessages.birthYear ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
            placeholder="Bitte eingeben (z.B. 1985)"
            required
          />
          {validationMessages.birthYear && (
            <div className="flex items-center mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{validationMessages.birthYear}</span>
            </div>
          )}
        </div>
        
        <div className={`transition-all duration-300 ${focusedField === 'age' ? 'transform scale-105' : ''}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Alter
            <EnhancedTooltip
              content="Ihr aktuelles Alter wird für die Berechnung der verbleibenden Beitragsjahre bis zur Rente verwendet."
              position="top"
            >
              <Info className="w-4 h-4 text-gray-400 hover:text-green-500 cursor-help" />
            </EnhancedTooltip>
          </label>
          <input
            type="number"
            min="0"
            max="120"
            value={personal.age === 0 ? '' : personal.age}
            onChange={(e) => handleAgeChange(parseInt(e.target.value) || 0)}
            onFocus={() => setFocusedField('age')}
            onBlur={() => setFocusedField(null)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
              validationMessages.age ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
            }`}
            placeholder="Bitte eingeben (z.B. 38)"
          />
          {validationMessages.age && (
            <div className="flex items-center mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{validationMessages.age}</span>
            </div>
          )}
        </div>
      </div>

      {/* Marital Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Heart className="inline h-4 w-4 mr-1" />
          Familienstand *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {maritalStatusOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                personal.maritalStatus === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="maritalStatus"
                value={option.value}
                checked={personal.maritalStatus === option.value}
                onChange={(e) => handleMaritalStatusChange(e.target.value as MaritalStatus)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                personal.maritalStatus === option.value
                  ? 'border-blue-500'
                  : 'border-gray-300'
              }`}>
                {personal.maritalStatus === option.value && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-900">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Calculation Scope for Married Couples */}
      {personal.maritalStatus === 'verheiratet' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Users className="inline h-4 w-4 mr-1" />
            Berechnung für *
          </label>
          <div className="space-y-3">
            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
              personal.calcScope === 'eine_person'
                ? 'border-blue-500 bg-white'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}>
              <input
                type="radio"
                name="calcScope"
                value="eine_person"
                checked={personal.calcScope === 'eine_person'}
                onChange={(e) => handleCalcScopeChange(e.target.value as CalcScope)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                personal.calcScope === 'eine_person'
                  ? 'border-blue-500'
                  : 'border-gray-300'
              }`}>
                {personal.calcScope === 'eine_person' && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">Eine Person</span>
                <p className="text-xs text-gray-600 mt-1">
                  Berechnung nur für mich (Hauptverdiener)
                </p>
              </div>
            </label>
            
            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
              personal.calcScope === 'beide_personen'
                ? 'border-blue-500 bg-white'
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}>
              <input
                type="radio"
                name="calcScope"
                value="beide_personen"
                checked={personal.calcScope === 'beide_personen'}
                onChange={(e) => handleCalcScopeChange(e.target.value as CalcScope)}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                personal.calcScope === 'beide_personen'
                  ? 'border-blue-500'
                  : 'border-gray-300'
              }`}>
                {personal.calcScope === 'beide_personen' && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-gray-900">Beide Personen</span>
                <p className="text-xs text-gray-600 mt-1">
                  Gemeinsame Berechnung für beide Ehepartner
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Children */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Baby className="inline h-4 w-4 mr-1" />
          Kinder
        </label>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={personal.children.has}
              onChange={(e) => handleChildrenChange(e.target.checked, personal.children.count)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-900">
              Ich habe Kinder
            </span>
          </label>
          
          {personal.children.has && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anzahl Kinder
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={personal.children.count === 0 ? '' : personal.children.count}
                onChange={(e) => handleChildrenChange(true, parseInt(e.target.value) || 0)}
                className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Anzahl"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tax Settings (Optional) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <Settings className="inline h-4 w-4" />
            Steuereinstellungen (optional)
          </label>
          <button
            type="button"
            onClick={() => setShowTaxSettings(!showTaxSettings)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showTaxSettings ? 'Ausblenden' : 'Anpassen'}
          </button>
        </div>

        {showTaxSettings && (
          <div className="ml-6 space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                Sparer-Pauschbetrag
                <EnhancedTooltip content="Betrag, bis zu dem Kapitalerträge steuerfrei bleiben. Standard: 1.000€ (Single) / 2.000€ (Verheiratet)" />
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={data.taxSettings?.sparerPauschbetrag ?? getSparerPauschbetrag(data)}
                  onChange={(e) => updateTaxSettings({ sparerPauschbetrag: parseInt(e.target.value) || 0 })}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={getSparerPauschbetrag(data).toString()}
                />
                <span className="text-sm text-gray-600">€</span>
                <button
                  type="button"
                  onClick={() => updateTaxSettings({ sparerPauschbetrag: undefined })}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Standard
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Standard: {getSparerPauschbetrag(data)}€ (basierend auf Familienstand)
              </p>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.taxSettings?.churchTax ?? false}
                  onChange={(e) => updateTaxSettings({ churchTax: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">
                  Kirchensteuer berücksichtigen
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">💡 Hinweise</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Geburtsjahr und Alter werden automatisch synchronisiert</li>
          <li>• Bei verheirateten Paaren können Sie wählen, ob die Berechnung für eine oder beide Personen erfolgen soll</li>
          <li>• Ihre Angaben werden automatisch gespeichert</li>
        </ul>
      </div>
    </div>
  );
};

export default PersonalDataStep;