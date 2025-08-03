
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { Plus, Calendar, Clock, Stethoscope, AlertCircle } from 'lucide-react';
import type { Appointment, CreateAppointmentInput, Patient, User as UserType } from '../../../server/src/schema';

export function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateAppointmentInput>({
    patient_id: 0,
    doctor_id: 0,
    appointment_date: new Date(),
    duration_minutes: 30,
    status: 'scheduled',
    notes: null,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [appointmentsData, patientsData, usersData] = await Promise.all([
        trpc.getAppointments.query(),
        trpc.getPatients.query(),
        trpc.getUsers.query(),
      ]);
      
      setAppointments(appointmentsData);
      setPatients(patientsData);
      setDoctors(usersData.filter((user: UserType) => user.role === 'doctor'));
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Unable to load appointment data. Using demo data.');
      
      // Set demo data when API fails
      const demoPatients: Patient[] = [
        {
          id: 1,
          patient_code: 'P001',
          full_name: 'John Doe',
          date_of_birth: new Date('1985-06-15'),
          gender: 'male' as const,
          phone: '+1-555-0123',
          email: 'john.doe@email.com',
          address: '123 Main St',
          emergency_contact_name: 'Jane Doe',
          emergency_contact_phone: '+1-555-0124',
          blood_type: 'A+',
          allergies: null,
          past_medical_history: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const demoDoctors: UserType[] = [
        {
          id: 1,
          username: 'dr.smith',
          email: 'dr.smith@clinic.com',
          password_hash: '',
          full_name: 'Dr. Smith',
          role: 'doctor' as const,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      const demoAppointments: Appointment[] = [
        {
          id: 1,
          patient_id: 1,
          doctor_id: 1,
          appointment_date: new Date(),
          duration_minutes: 30,
          status: 'scheduled' as const,
          notes: 'Regular checkup',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      setPatients(demoPatients);
      setDoctors(demoDoctors);
      setAppointments(demoAppointments);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newAppointment = await trpc.createAppointment.mutate(formData);
      setAppointments((prev: Appointment[]) => [newAppointment, ...prev]);
      setFormData({
        patient_id: 0,
        doctor_id: 0,
        appointment_date: new Date(),
        duration_minutes: 30,
        status: 'scheduled',
        notes: null,
      });
      setShowForm(false);
      setError(null);
    } catch (error) {
      console.error('Failed to create appointment:', error);
      setError('Unable to create appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'no_show': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPatientName = (patientId: number) => {
    const patient = patients.find((p: Patient) => p.id === patientId);
    return patient?.full_name || 'Unknown Patient';
  };

  const getDoctorName = (doctorId: number) => {
    const doctor = doctors.find((d: UserType) => d.id === doctorId);
    return doctor?.full_name || 'Unknown Doctor';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-purple-600" />
            Appointment Management
          </h2>
          <p className="text-gray-600 mt-1">Schedule and manage patient appointments 📅</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Appointment
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

      {/* Add Appointment Form */}
      {showForm && (
        <Card className="bg-white/90 backdrop-blur-sm border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Schedule New Appointment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient_id">Patient *</Label>
                  <Select 
                    value={formData.patient_id > 0 ? formData.patient_id.toString() : 'none'} 
                    onValueChange={(value) => 
                      setFormData((prev: CreateAppointmentInput) => ({ 
                        ...prev, 
                        patient_id: value === 'none' ? 0 : parseInt(value) 
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select a patient</SelectItem>
                      {patients.map((patient: Patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.full_name} ({patient.patient_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="doctor_id">Doctor *</Label>
                  <Select 
                    value={formData.doctor_id > 0 ? formData.doctor_id.toString() : 'none'} 
                    onValueChange={(value) => 
                      setFormData((prev: CreateAppointmentInput) => ({ 
                        ...prev, 
                        doctor_id: value === 'none' ? 0 : parseInt(value) 
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select a doctor</SelectItem>
                      {doctors.map((doctor: UserType) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="appointment_date">Appointment Date & Time *</Label>
                  <Input
                    id="appointment_date"
                    type="datetime-local"
                    value={new Date(formData.appointment_date).toISOString().slice(0, 16)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateAppointmentInput) => ({ 
                        ...prev, 
                        appointment_date: new Date(e.target.value) 
                      }))
                    }
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData((prev: CreateAppointmentInput) => ({ 
                        ...prev, 
                        duration_minutes: parseInt(e.target.value) || 30 
                      }))
                    }
                    min="15"
                    max="180"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData((prev: CreateAppointmentInput) => ({ 
                      ...prev, 
                      notes: e.target.value || null 
                    }))
                  }
                  placeholder="Any additional notes for the appointment..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                  {loading ? 'Scheduling...' : 'Schedule Appointment'}
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

      {/* Appointments List */}
      <div className="grid gap-6">
        {loading && appointments.length === 0 ? (
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
        ) : appointments.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Appointments Scheduled</h3>
              <p className="text-gray-500 mb-6">Start by scheduling your first appointment.</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule First Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment: Appointment) => (
            <Card key={appointment.id} className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {getPatientName(appointment.patient_id)}
                      </h3>
                      <p className="text-gray-600 flex items-center gap-1">
                        <Stethoscope className="h-4 w-4" />
                        {getDoctorName(appointment.doctor_id)}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {appointment.appointment_date.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {appointment.appointment_date.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {appointment.duration_minutes} minutes
                    </span>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{appointment.notes}</p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  Created: {appointment.created_at.toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
