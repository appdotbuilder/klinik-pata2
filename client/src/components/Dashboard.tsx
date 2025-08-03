
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { Users, Calendar, CreditCard, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { DashboardStats } from '../../../server/src/schema';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trpc.getDashboardStats.query();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      setError('Unable to load dashboard statistics. Using demo data.');
      // Set demo data when API fails
      setStats({
        total_patients: 42,
        appointments_today: 8,
        pending_bills: 15,
        total_revenue: 12500.50,
        recent_appointments: [
          {
            id: 1,
            patient_name: 'John Doe',
            doctor_name: 'Dr. Smith',
            appointment_date: new Date(),
            status: 'scheduled' as const,
          },
          {
            id: 2,
            patient_name: 'Jane Wilson',
            doctor_name: 'Dr. Johnson',
            appointment_date: new Date(Date.now() - 3600000),
            status: 'completed' as const,
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_patients || 0}</div>
            <p className="text-xs text-blue-100">
              Registered in the system
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.appointments_today || 0}</div>
            <p className="text-xs text-green-100">
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
            <CreditCard className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_bills || 0}</div>
            <p className="text-xs text-orange-100">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.total_revenue?.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-purple-100">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Recent Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recent_appointments && stats.recent_appointments.length > 0 ? (
            <div className="space-y-4">
              {stats.recent_appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-600' :
                      appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{appointment.patient_name}</p>
                      <p className="text-sm text-gray-600">{appointment.doctor_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {appointment.appointment_date.toLocaleDateString()}
                    </p>
                    <p className={`text-xs capitalize px-2 py-1 rounded-full ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-600' :
                      appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {appointment.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent appointments found 📅</p>
              <p className="text-sm text-gray-400 mt-2">
                Appointments will appear here once they are scheduled
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Info */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">System Overview</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <p className="text-gray-600">Patient Management</p>
              <p className="font-semibold text-green-600">✅ Active</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <p className="text-gray-600">Appointment System</p>
              <p className="font-semibold text-blue-600">✅ Ready</p>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg">
              <p className="text-gray-600">Sales & Inventory</p>
              <p className="font-semibold text-purple-600">✅ Operational</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
