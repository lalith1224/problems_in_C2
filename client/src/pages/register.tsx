import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Heart, User, Stethoscope, Pill, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUserSchema, type RegisterUser } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<"patient" | "doctor" | "pharmacy" | null>(null);

  const form = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      role: "patient",
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterUser) => {
      await apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Welcome to MediConnect! Please sign in to continue.",
      });
      setLocation("/login");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterUser) => {
    registerMutation.mutate(data);
  };

  const handleRoleSelect = (role: "patient" | "doctor" | "pharmacy") => {
    setSelectedRole(role);
    form.setValue("role", role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-doctor/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-border shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Heart className="h-8 w-8 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground">Join MediConnect</h2>
            <p className="text-muted-foreground">Create your account to get started</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium text-foreground mb-3 block">I am a:</Label>
            <div className="grid grid-cols-3 gap-2">
              <label className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedRole === 'patient' ? 'ring-2 ring-patient bg-patient/5' : 'border-border hover:bg-patient/5'
              }`}>
                <input
                  type="radio"
                  {...form.register("role")}
                  value="patient"
                  className="sr-only"
                  onChange={() => handleRoleSelect('patient')}
                />
                <User className="h-5 w-5 text-patient mb-1" />
                <span className="text-xs font-medium">Patient</span>
              </label>
              <label className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedRole === 'doctor' ? 'ring-2 ring-doctor bg-doctor/5' : 'border-border hover:bg-doctor/5'
              }`}>
                <input
                  type="radio"
                  {...form.register("role")}
                  value="doctor"
                  className="sr-only"
                  onChange={() => handleRoleSelect('doctor')}
                />
                <Stethoscope className="h-5 w-5 text-doctor mb-1" />
                <span className="text-xs font-medium">Doctor</span>
              </label>
              <label className={`flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedRole === 'pharmacy' ? 'ring-2 ring-pharmacy bg-pharmacy/5' : 'border-border hover:bg-pharmacy/5'
              }`}>
                <input
                  type="radio"
                  {...form.register("role")}
                  value="pharmacy"
                  className="sr-only"
                  onChange={() => handleRoleSelect('pharmacy')}
                />
                <Pill className="h-5 w-5 text-pharmacy mb-1" />
                <span className="text-xs font-medium">Pharmacy</span>
              </label>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                placeholder="Enter your first name"
                data-testid="input-firstname"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.firstName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                placeholder="Enter your last name"
                data-testid="input-lastname"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.lastName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="Enter your email"
                data-testid="input-email"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
                placeholder="Create a strong password"
                data-testid="input-password"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Doctor-specific fields */}
            {selectedRole === 'doctor' && (
              <>
                <div>
                  <Label htmlFor="licenseNumber">Medical License Number</Label>
                  <Input
                    id="licenseNumber"
                    {...form.register("licenseNumber")}
                    placeholder="Enter license number"
                    data-testid="input-license"
                  />
                </div>
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Select onValueChange={(value) => form.setValue("specialization", value)}>
                    <SelectTrigger data-testid="select-specialization">
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Medicine</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Pharmacy-specific fields */}
            {selectedRole === 'pharmacy' && (
              <>
                <div>
                  <Label htmlFor="pharmacyName">Pharmacy Name</Label>
                  <Input
                    id="pharmacyName"
                    {...form.register("pharmacyName")}
                    placeholder="Enter pharmacy name"
                    data-testid="input-pharmacy-name"
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">Pharmacy License Number</Label>
                  <Input
                    id="licenseNumber"
                    {...form.register("licenseNumber")}
                    placeholder="Enter license number"
                    data-testid="input-pharmacy-license"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    {...form.register("address")}
                    placeholder="Enter pharmacy address"
                    data-testid="input-address"
                  />
                </div>
              </>
            )}

            {/* Patient-specific fields */}
            {selectedRole === 'patient' && (
              <>
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    placeholder="Enter your phone number"
                    data-testid="input-phone"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
              data-testid="button-register"
            >
              {registerMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-center mt-6 pt-6 border-t border-border">
            <Lock className="h-4 w-4 text-muted-foreground mr-2" />
            <span className="text-xs text-muted-foreground">HIPAA Compliant & Secure</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
