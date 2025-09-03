import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Pill, User, Calendar, FileText, Plus, Minus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  instructions: z.string().optional(),
});

const prescriptionSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  medications: z.array(medicationSchema).min(1, "At least one medication is required"),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  notes: z.string().optional(),
  duration: z.string().min(1, "Treatment duration is required"),
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
type MedicationData = z.infer<typeof medicationSchema>;

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export default function PrescriptionModal({ isOpen, onClose, userRole }: PrescriptionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [medications, setMedications] = useState<MedicationData[]>([{
    name: "",
    dosage: "",
    frequency: "",
    instructions: "",
  }]);

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: "",
      medications: [{
        name: "",
        dosage: "",
        frequency: "",
        instructions: "",
      }],
      diagnosis: "",
      notes: "",
      duration: "",
    },
  });

  // Fetch patients (for doctors)
  const { data: patients, isLoading: patientsLoading } = useQuery({
    queryKey: ["/api/patients"],
    enabled: isOpen && userRole === "doctor",
  });

  // Create prescription mutation
  const createPrescriptionMutation = useMutation({
    mutationFn: async (data: PrescriptionFormData) => {
      const endpoint = userRole === "doctor" ? "/api/prescriptions" : "/api/pharmacy/prescriptions";
      return await apiRequest(endpoint, "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Prescription Created Successfully!",
        description: "The prescription has been created and sent to the pharmacy.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/doctor/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy/dashboard"] });
      form.reset();
      setMedications([{ name: "", dosage: "", frequency: "", instructions: "" }]);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create prescription. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PrescriptionFormData) => {
    const formData = { ...data, medications };
    createPrescriptionMutation.mutate(formData);
  };

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", frequency: "", instructions: "" }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index: number, field: keyof MedicationData, value: string) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const frequencyOptions = [
    { value: "once_daily", label: "Once Daily" },
    { value: "twice_daily", label: "Twice Daily" },
    { value: "three_times_daily", label: "Three Times Daily" },
    { value: "four_times_daily", label: "Four Times Daily" },
    { value: "as_needed", label: "As Needed" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const durationOptions = [
    { value: "3_days", label: "3 Days" },
    { value: "7_days", label: "7 Days" },
    { value: "14_days", label: "14 Days" },
    { value: "30_days", label: "30 Days" },
    { value: "60_days", label: "60 Days" },
    { value: "90_days", label: "90 Days" },
    { value: "ongoing", label: "Ongoing" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" data-testid="modal-prescription">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-primary" />
            Create New Prescription
          </DialogTitle>
          <DialogDescription>
            Create a detailed prescription with medications and instructions for the patient.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Patient Selection (for doctors) */}
            {userRole === "doctor" && (
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Select Patient
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-patient">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patientsLoading ? (
                          <SelectItem value="loading" disabled>Loading patients...</SelectItem>
                        ) : (
                          (patients as any[])?.map((patient: any) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                                <span className="text-sm text-muted-foreground">ID: P{patient.id?.slice(-5)}</span>
                              </div>
                            </SelectItem>
                          )) || []
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Diagnosis */}
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Diagnosis
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter primary diagnosis"
                      data-testid="input-diagnosis"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Pill className="h-4 w-4" />
                  Medications
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMedication}
                  data-testid="button-add-medication"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medication
                </Button>
              </div>

              {medications.map((medication, index) => (
                <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Medication {index + 1}</h4>
                    {medications.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        data-testid={`button-remove-medication-${index}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Medication Name</label>
                      <Input
                        placeholder="e.g., Amoxicillin"
                        value={medication.name}
                        onChange={(e) => updateMedication(index, "name", e.target.value)}
                        data-testid={`input-medication-name-${index}`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Dosage</label>
                      <Input
                        placeholder="e.g., 500mg"
                        value={medication.dosage}
                        onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                        data-testid={`input-medication-dosage-${index}`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Frequency</label>
                      <Select
                        value={medication.frequency}
                        onValueChange={(value) => updateMedication(index, "frequency", value)}
                      >
                        <SelectTrigger data-testid={`select-medication-frequency-${index}`}>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Special Instructions</label>
                      <Input
                        placeholder="e.g., Take with food"
                        value={medication.instructions}
                        onChange={(e) => updateMedication(index, "instructions", e.target.value)}
                        data-testid={`input-medication-instructions-${index}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Treatment Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Treatment Duration
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-duration">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select treatment duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional instructions or notes for the patient or pharmacy..."
                      className="min-h-[80px]"
                      data-testid="textarea-notes"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes for the patient or pharmacy staff
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel-prescription"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPrescriptionMutation.isPending}
                data-testid="button-create-prescription"
              >
                {createPrescriptionMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Pill className="h-4 w-4 mr-2" />
                    Create Prescription
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}