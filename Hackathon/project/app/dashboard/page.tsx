'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { KPICard } from '@/components/KPICard';
import { IncidentTable } from '@/components/IncidentTable';
import { TimeSeriesChart } from '@/components/TimeSeriesChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Radio, Camera, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Incident } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: incidentsData, error } = await supabase
        .from('incidents')
        .select('*')
        .order('reported_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      if (incidentsData) {
        const formattedIncidents: Incident[] = incidentsData.map((inc) => ({
          id: inc.id,
          title: inc.title,
          description: inc.description,
          status: inc.status,
          severity: inc.severity,
          type: inc.type,
          location: inc.location,
          reportedAt: inc.reported_at,
          resolvedAt: inc.resolved_at,
          assignedTo: inc.assigned_to,
          tags: inc.tags || [],
        }));
        setIncidents(formattedIncidents);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockChartData = Array.from({ length: 24 }, (_, i) => ({
    timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
    value: Math.floor(Math.random() * 50) + 50,
  }));

  const activeIncidentsCount = incidents.filter((i) => i.status === 'active').length;
  const totalIncidents = incidents.length;

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview of city operations
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            label="Active Incidents"
            value={activeIncidentsCount}
            change={-12}
            trend="down"
            icon={<AlertCircle className="h-5 w-5" />}
          />
          <KPICard
            label="Online Sensors"
            value="248"
            change={3}
            trend="up"
            icon={<Radio className="h-5 w-5" />}
          />
          <KPICard
            label="CCTV Cameras"
            value="156"
            change={0}
            trend="neutral"
            icon={<Camera className="h-5 w-5" />}
          />
          <KPICard
            label="System Health"
            value="98.5%"
            change={1.2}
            trend="up"
            icon={<Activity className="h-5 w-5" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TimeSeriesChart
            title="Incident Trends (24h)"
            data={mockChartData}
            color="#ef4444"
            yAxisLabel="Incidents"
          />
          <TimeSeriesChart
            title="Sensor Activity (24h)"
            data={mockChartData.map((d) => ({
              ...d,
              value: Math.floor(Math.random() * 30) + 70,
            }))}
            color="#3b82f6"
            yAxisLabel="Readings"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading incidents...
              </div>
            ) : (
              <IncidentTable
                incidents={incidents}
                onRowClick={(incident) => router.push(`/incidents/${incident.id}`)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
