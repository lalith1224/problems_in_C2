import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { format, addDays, isAfter, isSameDay } from "date-fns";
import { Calendar, Clock, User, FileText, X } from "lucide-react";
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

const appointmentSchema = z.object({
  doctorId: z.string().min(1, "Please select a doctor"),
  appointmentDate: z.string().min(1, "Please select a date"),
  appointmentTime: z.string().min(1, "Please select a time"),
  appointmentType: z.string().min(1, "Please select appointment type"),
  reason: z.string().min(10, "Please provide a detailed reason (minimum 10 characters)"),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentBookingModal({ isOpen, onClose }: AppointmentBookingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>("");

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
      appointmentType: "",
      reason: "",
    },
  });

  // Fetch available doctors
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ["/api/doctors"],
    enabled: isOpen,
  });

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`);
      
      return await apiRequest("/api/appointments", "POST", {
        doctorId: data.doctorId,
        appointmentDate: appointmentDateTime.toISOString(),
        appointmentType: data.appointmentType,
        reason: data.reason,
      });
    },
    onSuccess: () => {
      toast({
        title: "Appointment Booked Successfully!",
        description: "Your appointment has been scheduled. You will receive a confirmation email shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/patient/dashboard"] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AppointmentFormData) => {
    bookAppointmentMutation.mutate(data);
  };

  // Generate available dates (next 30 days, excluding Sundays)
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 30; i++) {
      const date = addDays(new Date(), i);
      if (date.getDay() !== 0) { // Exclude Sundays
        dates.push({
          value: format(date, "yyyy-MM-dd"),
          label: format(date, "EEE, MMM dd, yyyy"),
        });
      }
    }
    return dates;
  };

  // Generate available time slots
  const getAvailableTimeSlots = () => {
    const slots = [];
    // Morning slots: 9 AM to 12 PM
    for (let hour = 9; hour < 12; hour++) {
      slots.push({
        value: `${hour.toString().padStart(2, '0')}:00`,
        label: `${hour}:00 AM`,
        period: "Morning"
      });
      slots.push({
        value: `${hour.toString().padStart(2, '0')}:30`,
        label: `${hour}:30 AM`,
        period: "Morning"
      });
    }
    
    // Afternoon slots: 2 PM to 6 PM
    for (let hour = 14; hour < 18; hour++) {
      const displayHour = hour > 12 ? hour - 12 : hour;
      slots.push({
        value: `${hour.toString().padStart(2, '0')}:00`,
        label: `${displayHour}:00 PM`,
        period: "Afternoon"
      });
      slots.push({
        value: `${hour.toString().padStart(2, '0')}:30`,
        label: `${displayHour}:30 PM`,
        period: "Afternoon"
      });
    }
    
    return slots;
  };

  const appointmentTypes = [
    { value: "consultation", label: "General Consultation" },
    { value: "checkup", label: "Routine Checkup" },
    { value: "followup", label: "Follow-up Visit" },
    { value: "emergency", label: "Emergency Consultation" },
    { value: "specialist", label: "Specialist Consultation" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" data-testid="modal-book-appointment">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Book New Appointment
          </DialogTitle>
          <DialogDescription>
            Schedule an appointment with one of our healthcare professionals. Please provide all required information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Doctor Selection */}
            <FormField
              control={form.control}
              name="doctorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Select Doctor
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-doctor">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a doctor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {doctorsLoading ? (
                        <SelectItem value="loading" disabled>Loading doctors...</SelectItem>
                      ) : (
                        (doctors as any[])?.map((doctor: any) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</span>
                              <span className="text-sm text-muted-foreground">{doctor.specialization}</span>
                              {doctor.consultationFee && (
                                <span className="text-sm text-green-600">${doctor.consultationFee}</span>
                              )}
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

            {/* Date and Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Appointment Date
                    </FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedDate(value);
                      form.setValue("appointmentTime", ""); // Reset time when date changes
                    }} defaultValue={field.value} data-testid="select-date">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAvailableDates().map((date) => (
                          <SelectItem key={date.value} value={date.value}>
                            {date.label}
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
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Appointment Time
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedDate} data-testid="select-time">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={selectedDate ? "Select time" : "Select date first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAvailableTimeSlots().map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Appointment Type */}
            <FormField
              control={form.control}
              name="appointmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-appointment-type">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Reason for Visit
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe your symptoms, concerns, or reason for the appointment..."
                      className="min-h-[100px]"
                      data-testid="textarea-reason"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide detailed information to help the doctor prepare for your visit
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
                data-testid="button-cancel-appointment"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={bookAppointmentMutation.isPending}
                data-testid="button-confirm-appointment"
              >
                {bookAppointmentMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
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