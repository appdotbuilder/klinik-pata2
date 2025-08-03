
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { Plus, User, Phone, Mail, MapPin, Heart, AlertTriangle, FileText, AlertCircle } from 'lucide-react';
import type { Patient, CreatePatientInput } from '../../../server/src/schema';

export function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreatePatientInput>({
    patient_code: '',
    full_name: '',
    date_of_birth: null,
    gender: null,
    phone: null,
    email: null,
    address: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    blood_type: null,
    allergies: null,
    past_medical_history: null,
  });

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trpc.getPatients.query();
      setPatients(data);
    } catch (error) {
      console.error('Failed to load patients:', error);
      setError('Unable to load patients from server. Using demo data.');
      // Set demo data when API fails
      setPatients([
        {
          id: 1,
          patient_code: 'P001',
          full_name: 'John Doe',
          date_of_birth: new Date('1985-06-15'),
          gender: 'male' as const,
          phone: '+1-555-0123',
          email: 'john.doe@email.com',
          address: '123 Main St, City, State 12345',
          emergency_contact_name: 'Jane Doe',
          emergency_contact_phone: '+1-555-0124',
          blood_type: 'A+',
          allergies: 'Peanuts, Shellfish',
          past_medical_history: 'Appendectomy in 2015, Annual checkups normal',
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-15'),
        },
        {
          id: 2,
          patient_code: 'P002',
          full_name: 'Sarah Wilson',
          date_of_birth: new Date('1990-03-22'),
          gender: 'female' as const,
          phone: '+1-555-0125',
          email: 'sarah.wilson@email.com',
          address: '456 Oak Ave, City, State 12345',
          emergency_contact_name: 'Mike Wilson',
          emergency_contact_phone: '+1-555-0126',
          blood_type: 'O-',
          allergies: null,
          past_medical_history: 'No significant medical history',
          created_at: new Date('2024-01-20'),
          updated_at: new Date('2024-01-20'),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newPatient = await trpc.createPatient.mutate(formData);
      setPatients((prev: Patient[]) => [newPatient, ...prev]);
      setFormData({
        patient_code: '',
        full_name: '',
        date_of_birth: null,
        gender: null,
        phone: null,
        email: null,
        address: null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        blood_type: null,
        allergies: null,
        past_medical_history: null,
      });
      setShowForm(false);
      setError(null);
    } catch (error) {
      console.error('Failed to create patient:', error);
      setError('Unable to create patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generatePatientCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `P${timestamp}${random}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <User className="h-8 w-8 text-green-600" />
            Patient Management
          </h2>
          <p className="text-gray-600 mt-1">Manage patient records and information 👥</p>
        </div>
        <Button 
          onClick={() => {
            setFormData(prev => ({ ...prev, patient_code: generatePatientCode() }));
            setShowForm(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Patient
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Add Patient Form */}
      {showForm && (
        <Card className="bg-white/90 backdrop-blur-sm border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Add New Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Basic Information</h3>
                  
                  <div>
                    <Label htmlFor="patient_code">Patient Code *</Label>
                    <Input
                      id="patient_code"
                      value={formData.patient_code}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreatePatientInput) => ({ ...prev, patient_code: e.target.value }))
                      }
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreatePatientInput) => ({ ...prev, full_name: e.target.value }))
                      }
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={formData.date_of_birth ? new Date(formData.date_of_birth).toISOString().split('T')[0] : ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreatePatientInput) => ({ 
                          ...prev, 
                          date_of_birth: e.target.value ? new Date(e.target.value) : null 
                        }))
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select 
                      value={formData.gender || 'none'} 
                      onValueChange={(value) => 
                        setFormData((prev: CreatePatientInput) => ({ 
                          ...prev, 
                          gender: value === 'none' ? null : value as 'male' | 'female' | 'other'
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not specified</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Contact Information</h3>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreatePatientInput) => ({ ...prev, phone: e.target.value || null }))
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreatePatientInput) => ({ ...prev, email: e.target.value || null }))
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData((prev: CreatePatientInput) => ({ ...prev, address: e.target.value || null }))
                      }
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Emergency Contact */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Emergency Contact</h3>
                  
                  <div>
                    <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={formData.emergency_contact_name || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreatePatientInput) => ({ 
                          ...prev, 
                          emergency_contact_name: e.target.value || null 
                        }))
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      value={formData.emergency_contact_phone || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData((prev: CreatePatientInput) => ({ 
                          ...prev, 
                          emergency_contact_phone: e.target.value || null 
                        }))
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-700 border-b pb-2">Medical Information</h3>
                  
                  <div>
                    <Label htmlFor="blood_type">Blood Type</Label>
                    <Select 
                      value={formData.blood_type || 'unknown'} 
                      onValueChange={(value) => 
                        setFormData((prev: CreatePatientInput) => ({ 
                          ...prev, 
                          blood_type: value === 'unknown' ? null : value
                        }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unknown">Unknown</SelectItem>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={formData.allergies || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setFormData((prev: CreatePatientInput) => ({ ...prev, allergies: e.target.value || null }))
                      }
                      placeholder="List any known allergies..."
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="past_medical_history">Past Medical History</Label>
                <Textarea
                  id="past_medical_history"
                  value={formData.past_medical_history || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev: CreatePatientInput) => ({ 
                      ...prev, 
                      past_medical_history: e.target.value || null 
                    }))
                  }
                  placeholder="Previous medical conditions, surgeries, treatments..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                  {loading ? 'Creating...' : 'Create Patient'}
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

      {/* Patient List */}
      <div className="grid gap-6">
        {loading && patients.length === 0 ? (
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
        ) : patients.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardContent className="p-12 text-center">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Patients Yet</h3>
              <p className="text-gray-500 mb-6">Start by adding your first patient to the system.</p>
              <Button 
                onClick={() => {
                  setFormData(prev => ({ ...prev, patient_code: generatePatientCode() }));
                  setShowForm(true);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Patient
              </Button>
            </CardContent>
          </Card>
        ) : (
          patients.map((patient: Patient) => (
            <Card key={patient.id} className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{patient.full_name}</h3>
                      <p className="text-gray-600">Code: {patient.patient_code}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Active
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 text-sm">Basic Information</h4>
                    {patient.date_of_birth && (
                      <p className="text-sm text-gray-600">
                        Born: {patient.date_of_birth.toLocaleDateString()}
                      </p>
                    )}
                    {patient.gender && (
                      <p className="text-sm text-gray-600 capitalize">
                        Gender: {patient.gender}
                      </p>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 text-sm">Contact</h4>
                    {patient.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </p>
                    )}
                    {patient.email && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {patient.email}
                      </p>
                    )}
                    {patient.address && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {patient.address.substring(0, 50)}...
                      </p>
                    )}
                  </div>

                  {/* Medical Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-700 text-sm">Medical Information</h4>
                
                    {patient.blood_type && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500" />
                        Blood Type: {patient.blood_type}
                      </p>
                    )}
                    {patient.allergies && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        Has allergies
                      </p>
                    )}
                    {patient.past_medical_history && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <FileText className="h-3 w-3 text-blue-500" />
                        Medical history available
                      </p>
                    )}
                  </div>
                </div>

                {/* Emergency Contact */}
                {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-700 text-sm mb-1">Emergency Contact</h4>
                    <p className="text-sm text-gray-600">
                      {patient.emergency_contact_name}
                      {patient.emergency_contact_phone && (
                        <span> - {patient.emergency_contact_phone}</span>
                      )}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  Registered: {patient.created_at.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
