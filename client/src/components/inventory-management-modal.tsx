import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Package, Plus, Minus, AlertTriangle, TrendingUp, Edit } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const inventorySchema = z.object({
  medicationName: z.string().min(1, "Medication name is required"),
  currentStock: z.number().min(0, "Stock cannot be negative"),
  minStockLevel: z.number().min(0, "Minimum stock level cannot be negative"),
  unitPrice: z.number().min(0, "Price cannot be negative"),
  category: z.string().min(1, "Category is required"),
  expiryDate: z.string().optional(),
  batchNumber: z.string().optional(),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface InventoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  editItem?: any;
}

export default function InventoryManagementModal({ isOpen, onClose, editItem }: InventoryManagementModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'add' | 'edit' | 'restock'>('add');

  const form = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      medicationName: editItem?.medicationName || "",
      currentStock: editItem?.currentStock || 0,
      minStockLevel: editItem?.minStockLevel || 10,
      unitPrice: editItem?.unitPrice || 0,
      category: editItem?.category || "",
      expiryDate: editItem?.expiryDate || "",
      batchNumber: editItem?.batchNumber || "",
    },
  });

  // Fetch current inventory
  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/pharmacy/inventory"],
    enabled: isOpen,
  });

  // Add/Update inventory mutation
  const inventoryMutation = useMutation({
    mutationFn: async (data: InventoryFormData) => {
      const endpoint = editItem 
        ? `/api/pharmacy/inventory/${editItem.id}` 
        : "/api/pharmacy/inventory";
      const method = editItem ? "PUT" : "POST";
      
      return await apiRequest(endpoint, method, data);
    },
    onSuccess: () => {
      toast({
        title: `Inventory ${editItem ? 'Updated' : 'Added'} Successfully!`,
        description: `The medication has been ${editItem ? 'updated' : 'added to'} your inventory.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/pharmacy/dashboard"] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Operation Failed",
        description: error.message || `Failed to ${editItem ? 'update' : 'add'} inventory item. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InventoryFormData) => {
    inventoryMutation.mutate(data);
  };

  const categories = [
    { value: "antibiotics", label: "Antibiotics" },
    { value: "pain_relief", label: "Pain Relief" },
    { value: "vitamins", label: "Vitamins & Supplements" },
    { value: "chronic_care", label: "Chronic Care" },
    { value: "otc", label: "Over-the-Counter" },
    { value: "prescription", label: "Prescription Only" },
    { value: "emergency", label: "Emergency Medicine" },
  ];

  const getStockStatus = (currentStock: number, minLevel: number) => {
    if (currentStock === 0) return { status: "out", color: "destructive", label: "Out of Stock" };
    if (currentStock <= minLevel) return { status: "low", color: "secondary", label: "Low Stock" };
    return { status: "good", color: "default", label: "In Stock" };
  };

  const quickRestockItems = (inventory as any[])?.filter((item: any) => 
    item.currentStock <= item.minStockLevel
  ) || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" data-testid="modal-inventory">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            {editItem ? 'Edit Inventory Item' : 'Inventory Management'}
          </DialogTitle>
          <DialogDescription>
            {editItem ? 'Update the inventory item details.' : 'Add new medications or manage existing inventory.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions for Low Stock */}
          {!editItem && quickRestockItems.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <h3 className="font-medium text-yellow-800">Low Stock Alert</h3>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                {quickRestockItems.length} items need restocking
              </p>
              <div className="flex flex-wrap gap-2">
                {quickRestockItems.slice(0, 3).map((item: any) => (
                  <Badge key={item.id} variant="secondary" className="text-xs">
                    {item.medicationName} ({item.currentStock} left)
                  </Badge>
                ))}
                {quickRestockItems.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{quickRestockItems.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Medication Name */}
              <FormField
                control={form.control}
                name="medicationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Medication Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Amoxicillin 500mg"
                        data-testid="input-medication-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} data-testid="select-category">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Unit Price */}
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          data-testid="input-unit-price"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Stock */}
                <FormField
                  control={form.control}
                  name="currentStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          data-testid="input-current-stock"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Minimum Stock Level */}
                <FormField
                  control={form.control}
                  name="minStockLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Stock Level</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10"
                          data-testid="input-min-stock"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expiry Date */}
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          data-testid="input-expiry-date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Batch Number */}
                <FormField
                  control={form.control}
                  name="batchNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., BT2024001"
                          data-testid="input-batch-number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Stock Status Preview */}
              {form.watch("currentStock") !== undefined && form.watch("minStockLevel") !== undefined && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    <span className="text-sm font-medium">Stock Status:</span>
                    <Badge variant={getStockStatus(form.watch("currentStock"), form.watch("minStockLevel")).color as any}>
                      {getStockStatus(form.watch("currentStock"), form.watch("minStockLevel")).label}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  data-testid="button-cancel-inventory"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={inventoryMutation.isPending}
                  data-testid="button-save-inventory"
                >
                  {inventoryMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4 mr-2" />
                      {editItem ? 'Update Item' : 'Add to Inventory'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}