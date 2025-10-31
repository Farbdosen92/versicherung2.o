/**
 * Centralized Onboarding Flow - iPhone-Style Guided Questionnaire
 * Implements the comprehensive requirements from DevPlan documents
 * 
 * Features:
 * - Single guided page with 7 major blocks
 * - Apple-style progress indicator
 * - Auto-save to localStorage
 * - Real-time validation
 * - Welcome back functionality
 * - Complete pension gap analysis data collection
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Euro, 
  TrendingUp, 
  Home, 
  Target, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  Users,
  Briefcase,
  PiggyBank,
  FileText,
  RotateCcw
} from "lucide-react";
import { useLocation } from "wouter";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ==================== SCHEMA DEFINITION ====================

const onboardingSchema = z.object({
  // Block 1: Personal Data
  birthYear: z.number().min(1940).max(2010),
  age: z.number().min(18).max(85),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'separated', 'widowed']),
  hasChildren: z.boolean(),
  childrenCount: z.number().min(0).max(10).optional(),
  coupleMode: z.enum(['individual', 'joint']).optional(),

  // Block 2: Current Income
  netMonthlyIncome: z.number().min(0),
  grossAnnualIncome: z.number().min(0).optional(),
  hasOtherIncome: z.boolean(),
  otherIncomeType: z.enum(['rental', 'agriculture', 'business', 'alimony', 'capital']).optional(),
  otherIncomeAmount: z.number().min(0).optional(),

  // Block 3: Retirement Income Expectations
  expectedStatutoryPension: z.number().min(0), // REQUIRED - main field!
  hasCivilServantPension: z.boolean(),
  civilServantPension: z.number().min(0).optional(),
  hasVersorgungswerk: z.boolean(),
  versorgungswerkAmount: z.number().min(0).optional(),
  hasZVKVBL: z.boolean(),
  zvkVblAmount: z.number().min(0).optional(),

  // Block 4: Existing Private Pensions
  hasPrivatePension: z.boolean(),
  privatePensionAmount: z.number().min(0).optional(),
  hasRiester: z.boolean(),
  riesterAmount: z.number().min(0).optional(),
  hasRuerup: z.boolean(),
  ruerupAmount: z.number().min(0).optional(),
  hasOccupationalPension: z.boolean(),
  occupationalPensionAmount: z.number().min(0).optional(),

  // Block 5: Assets
  lifeInsuranceLumpSum: z.number().min(0).optional(),
  fundsBalance: z.number().min(0).optional(),
  etfDepotBalance: z.number().min(0).optional(),

  // Block 6: Liabilities (Mortgage)
  hasMortgage: z.boolean(),
  mortgageBalance: z.number().min(0).optional(),
  mortgageInterestLockEnd: z.number().min(2025).max(2055).optional(),
  mortgageBalanceAtLockEnd: z.number().min(0).optional(),
  mortgageInterestRate: z.number().min(0).max(20).optional(),

  // Block 7: Planning Goals
  plannedRetirementAge: z.number().min(63).max(70),
  monthlySavingsAmount: z.number().min(0),
  contractDurationYears: z.number().min(1).max(45),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

// ==================== STEP DEFINITIONS ====================

const STEPS = [
  { id: 1, title: 'Persönliche Daten', icon: User, block: 'personal' },
  { id: 2, title: 'Aktuelles Einkommen', icon: Euro, block: 'income' },
  { id: 3, title: 'Gesetzliche Rente', icon: TrendingUp, block: 'pension' },
  { id: 4, title: 'Private Vorsorge', icon: PiggyBank, block: 'private' },
  { id: 5, title: 'Vermögen', icon: Briefcase, block: 'assets' },
  { id: 6, title: 'Immobilienkredit', icon: Home, block: 'mortgage' },
  { id: 7, title: 'Planungsziele', icon: Target, block: 'planning' },
] as const;

const STORAGE_KEY = 'onboarding-data-v1';
const COMPLETION_KEY = 'onboarding-completed';

// ==================== MAIN COMPONENT ====================

export default function OnboardingNew() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const totalSteps = STEPS.length;

  // ==================== FORM SETUP ====================

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      // Block 1: Personal Data
      birthYear: 1985,
      age: 39,
      maritalStatus: 'single',
      hasChildren: false,
      childrenCount: 0,

      // Block 2: Current Income
      netMonthlyIncome: 3000,
      grossAnnualIncome: 50000,
      hasOtherIncome: false,

      // Block 3: Retirement Income Expectations
      expectedStatutoryPension: 1200, // DEFAULT VALUE
      hasCivilServantPension: false,
      hasVersorgungswerk: false,
      hasZVKVBL: false,

      // Block 4: Existing Private Pensions
      hasPrivatePension: false,
      hasRiester: false,
      hasRuerup: false,
      hasOccupationalPension: false,

      // Block 5: Assets
      lifeInsuranceLumpSum: 0,
      fundsBalance: 0,
      etfDepotBalance: 0,

      // Block 6: Liabilities
      hasMortgage: false,

      // Block 7: Planning Goals
      plannedRetirementAge: 67,
      monthlySavingsAmount: 250,
      contractDurationYears: 30,
    },
  });

  // ==================== LOAD/SAVE LOGIC ====================

  useEffect(() => {
    // Check for existing data
    const storedData = localStorage.getItem(STORAGE_KEY);
    const isCompleted = localStorage.getItem(COMPLETION_KEY);

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        Object.keys(parsedData).forEach((key) => {
          form.setValue(key as any, parsedData[key]);
        });
        setIsReturningUser(true);
        
        if (!isCompleted) {
          toast({
            title: "Willkommen zurück!",
            description: "Ihre vorherigen Eingaben wurden geladen.",
            duration: 3000,
          });
        }
      } catch (error) {
        console.error('Failed to load stored data:', error);
      }
    }
  }, []);

  // Auto-save on any form change
  useEffect(() => {
    const subscription = form.watch((value) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // ==================== VALIDATION ====================

  const validateCurrentStep = (): boolean => {
    const values = form.getValues();

    switch (currentStep) {
      case 1: // Personal Data
        return !!(values.birthYear && values.age >= 18 && values.maritalStatus);
      
      case 2: // Income
        return values.netMonthlyIncome > 0;
      
      case 3: // Statutory Pension - REQUIRED!
        return values.expectedStatutoryPension >= 0;
      
      case 4: // Private Pensions (all optional)
        return true;
      
      case 5: // Assets (all optional)
        return true;
      
      case 6: // Mortgage (optional)
        return true;
      
      case 7: // Planning Goals
        return values.plannedRetirementAge >= 63 && values.monthlySavingsAmount >= 0;
      
      default:
        return false;
    }
  };

  // ==================== NAVIGATION ====================

  const handleNext = () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Fehlende Angaben",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const formData = form.getValues();
    
    // Mark as completed
    localStorage.setItem(COMPLETION_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

    toast({
      title: "✅ Fragen abgeschlossen",
      description: "Ihre Angaben wurden gespeichert.",
    });

    // Redirect to dashboard
    setTimeout(() => {
      setLocation('/');
    }, 1000);
  };

  const handleReset = () => {
    if (confirm('Möchten Sie wirklich alle Eingaben zurücksetzen?')) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COMPLETION_KEY);
      form.reset();
      setCurrentStep(1);
      toast({
        title: "Zurückgesetzt",
        description: "Alle Daten wurden gelöscht.",
      });
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(value);
  };

  const calculateAge = (birthYear: number) => {
    return new Date().getFullYear() - birthYear;
  };

  // Auto-sync age with birth year
  const birthYear = form.watch('birthYear');
  useEffect(() => {
    if (birthYear && birthYear >= 1940 && birthYear <= 2010) {
      form.setValue('age', calculateAge(birthYear));
    }
  }, [birthYear]);

  // ==================== STEP RENDERING ====================

  const renderStep = () => {
    switch (currentStep) {
      // ==================== STEP 1: PERSONAL DATA ====================
      case 1:
        return (
          <div className="space-y-8">
            {/* Birth Year / Age */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="birthYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Geburtsjahr
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1985"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="text-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Alter (automatisch berechnet)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        disabled
                        className="text-lg bg-muted"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Wird automatisch aus Geburtsjahr berechnet
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            {/* Marital Status */}
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Familienstand
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 md:grid-cols-5 gap-3"
                    >
                      {[
                        { value: 'single', label: 'Ledig' },
                        { value: 'married', label: 'Verheiratet' },
                        { value: 'divorced', label: 'Geschieden' },
                        { value: 'separated', label: 'Getrennt lebend' },
                        { value: 'widowed', label: 'Verwitwet' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-accent">
                          <RadioGroupItem value={option.value} id={option.value} />
                          <Label htmlFor={option.value} className="cursor-pointer flex-1">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Children */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hasChildren"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Ich habe Kinder
                    </FormLabel>
                  </FormItem>
                )}
              />

              {form.watch('hasChildren') && (
                <FormField
                  control={form.control}
                  name="childrenCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Anzahl der Kinder</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="max-w-[120px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Couple Mode (if married) */}
            {form.watch('maritalStatus') === 'married' && (
              <FormField
                control={form.control}
                name="coupleMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Berechnung für Sie allein oder beide Partner?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent">
                          <RadioGroupItem value="individual" id="individual" />
                          <Label htmlFor="individual" className="cursor-pointer flex-1">
                            Nur für mich
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent">
                          <RadioGroupItem value="joint" id="joint" />
                          <Label htmlFor="joint" className="cursor-pointer flex-1">
                            Für beide gemeinsam
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );

      // ==================== STEP 2: CURRENT INCOME ====================
      case 2:
        return (
          <div className="space-y-8">
            {/* Net Monthly Income */}
            <FormField
              control={form.control}
              name="netMonthlyIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-lg">
                    <Euro className="w-5 h-5" />
                    Monatliches Nettoeinkommen
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">
                        €
                      </span>
                      <Input
                        type="number"
                        placeholder="3000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="text-2xl font-bold h-16 pl-12 pr-6"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Ihr aktuelles monatliches Nettoeinkommen (nach Steuern und Sozialabgaben)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gross Annual Income (optional) */}
            <FormField
              control={form.control}
              name="grossAnnualIncome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bruttojahreseinkommen (optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                        €
                      </span>
                      <Input
                        type="number"
                        placeholder="50000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        className="text-lg pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Hilft bei der Berechnung Ihres Grenzsteuersatzes
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Other Income */}
            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="hasOtherIncome"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Ich habe sonstige Einkünfte
                    </FormLabel>
                  </FormItem>
                )}
              />

              {form.watch('hasOtherIncome') && (
                <div className="grid md:grid-cols-2 gap-4 ml-6">
                  <FormField
                    control={form.control}
                    name="otherIncomeType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Art der Einkünfte</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Bitte wählen" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="rental">Vermietung & Verpachtung</SelectItem>
                            <SelectItem value="agriculture">Landwirtschaft</SelectItem>
                            <SelectItem value="business">Gewerbebetrieb</SelectItem>
                            <SelectItem value="alimony">Unterhalt</SelectItem>
                            <SelectItem value="capital">Kapitalerträge</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="otherIncomeAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Höhe (monatlich)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                              €
                            </span>
                            <Input
                              type="number"
                              placeholder="800"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                              className="pl-8"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        );

      // ==================== STEP 3: STATUTORY PENSION ====================
      case 3:
        return (
          <div className="space-y-8">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Wichtig:</strong> Diese Angaben finden Sie in Ihrer jährlichen Renteninformation der Deutschen Rentenversicherung.
              </AlertDescription>
            </Alert>

            {/* Expected Statutory Pension - REQUIRED FIELD! */}
            <FormField
              control={form.control}
              name="expectedStatutoryPension"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5" />
                    Erwartete gesetzliche Altersrente mit 67
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">
                        €
                      </span>
                      <Input
                        type="number"
                        placeholder="1200"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="text-2xl font-bold h-16 pl-12 pr-20"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                        € / Monat
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription>
                    💡 Steht in Ihrer Renteninformation unter "Regelaltersrente"
                  </FormDescription>
                  <FormMessage />
                  
                  {/* Quick Selection Buttons */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {[800, 1200, 1600].map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={field.value === amount ? "default" : "outline"}
                        onClick={() => field.onChange(amount)}
                        className="w-full"
                      >
                        {formatCurrency(amount)}
                      </Button>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            {/* Civil Servant Pension */}
            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="hasCivilServantPension"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Ich erhalte eine Beamtenpension
                    </FormLabel>
                  </FormItem>
                )}
              />

              {form.watch('hasCivilServantPension') && (
                <FormField
                  control={form.control}
                  name="civilServantPension"
                  render={({ field }) => (
                    <FormItem className="ml-6">
                      <FormLabel>Pension mit 67 (€/Monat)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="2500"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Versorgungswerk */}
            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="hasVersorgungswerk"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Ich bin in einem Versorgungswerk (Ärzte, Anwälte, etc.)
                    </FormLabel>
                  </FormItem>
                )}
              />

              {form.watch('hasVersorgungswerk') && (
                <FormField
                  control={form.control}
                  name="versorgungswerkAmount"
                  render={({ field }) => (
                    <FormItem className="ml-6">
                      <FormLabel>Leistung mit 67 (€/Monat)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1800"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* ZVK/VBL */}
            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="hasZVKVBL"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Ich habe eine ZVK/VBL-Zusatzversorgung (öffentlicher Dienst)
                    </FormLabel>
                  </FormItem>
                )}
              />

              {form.watch('hasZVKVBL') && (
                <FormField
                  control={form.control}
                  name="zvkVblAmount"
                  render={({ field }) => (
                    <FormItem className="ml-6">
                      <FormLabel>Rente mit 67 (€/Monat)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="350"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        );

      // ==================== STEP 4: PRIVATE PENSIONS ====================
      case 4:
        return (
          <div className="space-y-8">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Alle Felder in diesem Schritt sind optional. Geben Sie nur an, was vorhanden ist.
              </AlertDescription>
            </Alert>

            {/* Private Pension Insurance */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="hasPrivatePension"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-semibold">
                      Private Rentenversicherung
                    </FormLabel>
                  </FormItem>
                )}
              />

              {form.watch('hasPrivatePension') && (
                <FormField
                  control={form.control}
                  name="privatePensionAmount"
                  render={({ field }) => (
                    <FormItem className="ml-6">
                      <FormLabel>Monatliche Rente ab 67 (€/Monat)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="500"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Riester */}
            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="hasRiester"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-semibold">
                      Riester-Rente
                    </FormLabel>
                  </FormItem>
                )}
              />

              {form.watch('hasRiester') && (
                <FormField
                  control={form.control}
                  name="riesterAmount"
                  render={({ field }) => (
                    <FormItem className="ml-6">
                      <FormLabel>Monatliche Rente ab 67 (€/Monat)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="180"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Rürup */}
            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="hasRuerup"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-semibold">
                      Rürup-Rente / Basisrente
                    </FormLabel>
                  </FormItem>
                )}
              />

              {form.watch('hasRuerup') && (
                <FormField
                  control={form.control}
                  name="ruerupAmount"
                  render={({ field }) => (
                    <FormItem className="ml-6">
                      <FormLabel>Monatliche Rente ab 67 (€/Monat)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="220"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Occupational Pension (bAV) */}
            <div className="space-y-4 pt-4 border-t">
              <FormField
                control={form.control}
                name="hasOccupationalPension"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="cursor-pointer font-semibold">
                      Betriebsrente (bAV)
                    </FormLabel>
                  </FormItem>
                )}
              />

              {form.watch('hasOccupationalPension') && (
                <FormField
                  control={form.control}
                  name="occupationalPensionAmount"
                  render={({ field }) => (
                    <FormItem className="ml-6">
                      <FormLabel>Monatliche Rente ab 67 (€/Monat)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="280"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
        );

      // ==================== STEP 5: ASSETS ====================
      case 5:
        return (
          <div className="space-y-8">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Geben Sie hier Ihre bereits vorhandenen Vermögenswerte an.
              </AlertDescription>
            </Alert>

            {/* Life Insurance */}
            <FormField
              control={form.control}
              name="lifeInsuranceLumpSum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Lebensversicherung (Einmalbetrag bei Auszahlung)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                        €
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        className="text-lg pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">
                    Nicht monatlich! Einmaliger Betrag bei Fälligkeit
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Funds Balance */}
            <FormField
              control={form.control}
              name="fundsBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Fondsguthaben / Sparguthaben (aktuell)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                        €
                      </span>
                      <Input
                        type="number"
                        placeholder="15000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        className="text-lg pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ETF Depot */}
            <FormField
              control={form.control}
              name="etfDepotBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    ETF-Depot / Wertpapiere (aktuell)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                        €
                      </span>
                      <Input
                        type="number"
                        placeholder="8500"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                        className="text-lg pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      // ==================== STEP 6: MORTGAGE ====================
      case 6:
        return (
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="hasMortgage"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="cursor-pointer font-semibold text-lg">
                    Ich habe einen offenen Immobilienkredit
                  </FormLabel>
                </FormItem>
              )}
            />

            {form.watch('hasMortgage') && (
              <div className="space-y-6 ml-6 pt-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Diese Angaben helfen bei der Berechnung Ihrer verfügbaren Mittel im Ruhestand.
                  </AlertDescription>
                </Alert>

                <FormField
                  control={form.control}
                  name="mortgageBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aktuelle Restschuld</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                            €
                          </span>
                          <Input
                            type="number"
                            placeholder="187000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                            className="text-lg pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mortgageInterestLockEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ende der Zinsbindung (Jahr)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Jahr wählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => 2025 + i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mortgageBalanceAtLockEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voraussichtliche Restschuld am Ende der Zinsbindung</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                            €
                          </span>
                          <Input
                            type="number"
                            placeholder="145000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                            className="text-lg pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="mortgageInterestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aktueller Zinssatz</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="2.8"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                            className="text-lg pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                            %
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>
        );

      // ==================== STEP 7: PLANNING GOALS ====================
      case 7:
        return (
          <div className="space-y-8">
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                Legen Sie Ihre Ziele für die private Altersvorsorge fest.
              </AlertDescription>
            </Alert>

            {/* Planned Retirement Age */}
            <FormField
              control={form.control}
              name="plannedRetirementAge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">
                    Geplantes Renteneintrittsalter
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="number"
                        min="63"
                        max="70"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="text-2xl font-bold h-16 text-center"
                      />
                      <div className="grid grid-cols-4 gap-3">
                        {[63, 65, 67, 70].map((age) => (
                          <Button
                            key={age}
                            type="button"
                            variant={field.value === age ? "default" : "outline"}
                            onClick={() => field.onChange(age)}
                          >
                            {age} Jahre
                          </Button>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Reguläres Renteneintrittsalter ist 67 Jahre
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monthly Savings Amount */}
            <FormField
              control={form.control}
              name="monthlySavingsAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">
                    Monatlicher Sparbetrag für Altersvorsorge
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">
                        €
                      </span>
                      <Input
                        type="number"
                        placeholder="250"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="text-2xl font-bold h-16 pl-12 pr-6"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Wie viel können/möchten Sie monatlich sparen?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contract Duration */}
            <FormField
              control={form.control}
              name="contractDurationYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">
                    Gewünschte Laufzeit (Jahre)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max="45"
                        placeholder="30"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="text-2xl font-bold h-16 text-center"
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Basierend auf Ihrem Alter bis zum Renteneintritt: ca. {form.watch('plannedRetirementAge') - form.watch('age')} Jahre
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-secondary/20">
      {/* ==================== HEADER ==================== */}
      <header className="bg-card/95 backdrop-blur-xl border-b border-border/50 px-4 md:px-6 py-4 md:py-6 sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <User className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                Zentrale Fragen
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                Ihre Angaben für die Rentenplanung
              </p>
            </div>
          </div>
          
          {isReturningUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Zurücksetzen</span>
            </Button>
          )}
        </div>
      </header>

      {/* ==================== PROGRESS BAR ==================== */}
      <div className="bg-card/50 px-4 md:px-6 py-3 md:py-4 border-b border-border/30">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs md:text-sm font-medium text-muted-foreground">
              Schritt {currentStep} von {totalSteps}
            </span>
            <span className="text-xs md:text-sm font-medium text-primary">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          
          {/* Progress Dots */}
          <div className="flex items-center gap-2 mb-3">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                  step.id <= currentStep
                    ? 'bg-primary'
                    : 'bg-secondary'
                }`}
              />
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-1 py-6 md:py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <Form {...form}>
            <form className="space-y-6">
              <Card className="border-2 border-border/30 shadow-2xl">
                <CardHeader className="border-b bg-gradient-to-r from-card to-secondary/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      {(() => {
                        const Icon = STEPS[currentStep - 1].icon;
                        return <Icon className="w-6 h-6 text-primary" />;
                      })()}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl md:text-2xl">
                        {STEPS[currentStep - 1].title}
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {currentStep === 1 && "Grundlegende Informationen zu Ihrer Person"}
                        {currentStep === 2 && "Ihr monatliches Nettoeinkommen"}
                        {currentStep === 3 && "Erwartete Renten aus gesetzlichen Systemen"}
                        {currentStep === 4 && "Bestehende private Altersvorsorge"}
                        {currentStep === 5 && "Vorhandene Vermögenswerte"}
                        {currentStep === 6 && "Angaben zu bestehenden Krediten"}
                        {currentStep === 7 && "Ihre Ziele und Sparpläne"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 md:p-8">
                  {renderStep()}
                </CardContent>
              </Card>

              {/* ==================== NAVIGATION ==================== */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="gap-2"
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück
                </Button>

                <div className="flex-1 text-center text-sm text-muted-foreground">
                  {currentStep < totalSteps && !validateCurrentStep() && (
                    <span className="flex items-center justify-center gap-2 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      Bitte füllen Sie alle Pflichtfelder aus
                    </span>
                  )}
                </div>

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!validateCurrentStep()}
                    className="gap-2"
                    size="lg"
                  >
                    Weiter
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleComplete}
                    className="gap-2 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Abschließen
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-card/50 border-t border-border/30 px-4 py-4 text-center text-xs text-muted-foreground">
        <p>💾 Ihre Angaben werden automatisch gespeichert</p>
      </footer>
    </div>
  );
}
