
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { Plus, Pill, Package, AlertCircle, Calendar } from 'lucide-react';
import type { Medicine, CreateMedicineInput } from '../../../server/src/schema';

export function MedicineManagement() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<CreateMedicineInput>({
    name: '',
    description: null,
    dosage_form: null,
    strength: null,
    manufacturer: null,
    unit_price: 0,
    stock_quantity: 0,
    expiry_date: null,
  });

  const loadMedicines = useCallback(async () => {
    try {
      setLoading(true);
      const data = await trpc.getMedicines.query();
      setMedicines(data);
    } catch (error) {
      console.error('Failed to load medicines:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newMedicine = await trpc.createMedicine.mutate(formData);
      setMedicines((prev: Medicine[]) => [newMedicine, ...prev]);
      setFormData({
        name: '',
        description: null,
        dosage_form: null,
        strength: null,
        manufacturer: null,
        unit_price: 0,
        stock_quantity: 0,
        expiry_date: null,
      });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create medicine:', error);
    } finally {
      setLoading(false);
    }
  };

  const isExpiringSoon = (expiryDate: Date | null) => {
    if (!expiryDate) return false;
    const threMonthsFromNow = new Date();
    threMonthsFromNow.setMonth(threMonthsFromNow.getMonth() + 3);
    return expiryDate <= threMonthsFromNow;
  };

  const isLowStock = (quantity: number) => quantity <= 10;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Pill className="h-8 w-8 text-orange-600" />
            Medicine Management
          </h2>
          <p className="text-gray-600 mt-1">Manage medicine inventory and stock 💊</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Medicine
        </Button>
      </div>

      {/* Add Medicine Form */}
      {showForm && (
        <Card className="bg-white/90 backdrop-blur-sm border-orange-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Add New Medicine</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Medicine Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateMedicineInput) => ({ ...prev, name: e.target.value }))
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateMedicineInput) => ({ 
                        ...prev, 
                        manufacturer: e.target.value || null 
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="dosage_form">Dosage Form</Label>
                  <Input
                    id="dosage_form"
                    value={formData.dosage_form || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateMedicineInput) => ({ 
                        ...prev, 
                        dosage_form: e.target.value || null 
                      }))
                    }
                    placeholder="e.g., Tablet, Capsule, Syrup"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="strength">Strength</Label>
                  <Input
                    id="strength"
                    value={formData.strength || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateMedicineInput) => ({ 
                        ...prev, 
                        strength: e.target.value || null 
                      }))
                    }
                    placeholder="e.g., 500mg, 10ml"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="unit_price">Unit Price *</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    value={formData.unit_price}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateMedicineInput) => ({ 
                        ...prev, 
                        unit_price: parseFloat(e.target.value) || 0 
                      }))
                    }
                    step="0.01"
                    min="0"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateMedicineInput) => ({ 
                        ...prev, 
                        stock_quantity: parseInt(e.target.value) || 0 
                      }))
                    }
                    min="0"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date ? new Date(formData.expiry_date).toISOString().split('T')[0] : ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateMedicineInput) => ({ 
                        ...prev, 
                        expiry_date: e.target.value ? new Date(e.target.value) : null 
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev: CreateMedicineInput) => ({ 
                      ...prev, 
                      description: e.target.value || null 
                    }))
                  }
                  placeholder="Medicine description, usage instructions..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                  {loading ? 'Adding...' : 'Add Medicine'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Medicine List */}
      <div className="grid gap-6">
        {loading && medicines.length === 0 ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white/80 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : medicines.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardContent className="p-12 text-center">
              <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Medicines in Inventory</h3>
              <p className="text-gray-500 mb-6">Start by adding medicines to your inventory.</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Medicine
              </Button>
            </CardContent>
          </Card>
        ) : (
          medicines.map((medicine: Medicine) => (
            <Card key={medicine.id} className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Pill className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{medicine.name}</h3>
                      {medicine.manufacturer && (
                        <p className="text-gray-600">by {medicine.manufacturer}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isLowStock(medicine.stock_quantity) && (
                      <Badge className="bg-red-100 text-red-700 border-red-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Low Stock
                      </Badge>
                    )}
                    {medicine.expiry_date && isExpiringSoon(medicine.expiry_date) && (
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        <Calendar className="h-3 w-3 mr-1" />
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 text-sm mb-1">Dosage & Strength</h4>
                    <p className="text-sm text-gray-600">
                      {medicine.dosage_form || 'Not specified'}
                      {medicine.strength && ` - ${medicine.strength}`}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 text-sm mb-1">Price</h4>
                    <p className="text-lg font-semibold text-green-600">
                      ${medicine.unit_price.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 text-sm mb-1">Stock</h4>
                    <p className={`text-sm font-medium flex items-center gap-1 ${
                      isLowStock(medicine.stock_quantity) ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <Package className="h-3 w-3" />
                      {medicine.stock_quantity} units
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 text-sm mb-1">Expiry Date</h4>
                    <p className={`text-sm ${
                      medicine.expiry_date && isExpiringSoon(medicine.expiry_date) 
                        ? 'text-yellow-600' 
                        : 'text-gray-600'
                    }`}>
                      {medicine.expiry_date 
                        ? medicine.expiry_date.toLocaleDateString() 
                        : 'Not specified'
                      }
                    </p>
                  </div>
                </div>

                {medicine.description && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{medicine.description}</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  Added: {medicine.created_at.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
