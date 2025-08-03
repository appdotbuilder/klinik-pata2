
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientManagement } from '@/components/PatientManagement';
import { AppointmentManagement } from '@/components/AppointmentManagement';
import { Dashboard } from '@/components/Dashboard';
import { MedicineManagement } from '@/components/MedicineManagement';
import { SalesManagement } from '@/components/SalesManagement';
import { Activity, Users, Calendar, Pill, ShoppingCart, FileText } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Activity className="h-10 w-10 text-blue-600" />
            HealthCare Management System
          </h1>
          <p className="text-gray-600 text-lg">
            Complete healthcare management solution for modern medical practices 🏥
          </p>
        </div>

        {/* Main Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
            >
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="patients" 
              className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger 
              value="appointments" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger 
              value="medicines" 
              className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Pill className="h-4 w-4" />
              Medicines
            </TabsTrigger>
            <TabsTrigger 
              value="sales" 
              className="flex items-center gap-2 data-[state=active]:bg-indigo-500 data-[state=active]:text-white"
            >
              <ShoppingCart className="h-4 w-4" />
              Sales
            </TabsTrigger>
            <TabsTrigger 
              value="records" 
              className="flex items-center gap-2 data-[state=active]:bg-teal-500 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4" />
              Records
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <PatientManagement />
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <AppointmentManagement />
          </TabsContent>

          <TabsContent value="medicines" className="space-y-6">
            <MedicineManagement />
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <SalesManagement />
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-800 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-teal-600" />
                  Medical Records
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Medical records management coming soon... 📋
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
