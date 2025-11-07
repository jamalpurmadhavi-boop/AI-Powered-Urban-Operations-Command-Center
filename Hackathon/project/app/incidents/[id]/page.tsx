'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { IncidentDetail } from '@/components/IncidentDetail';
import { CityMap } from '@/components/CityMap';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Incident } from '@/lib/types';

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadIncident(params.id as string);
    }
  }, [params.id]);

  const loadIncident = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const formattedIncident: Incident = {
          id: data.id,
          title: data.title,
          description: data.description,
          status: data.status,
          severity: data.severity,
          type: data.type,
          location: data.location,
          reportedAt: data.reported_at,
          resolvedAt: data.resolved_at,
          assignedTo: data.assigned_to,
          tags: data.tags || [],
        };
        setIncident(formattedIncident);
      }
    } catch (error) {
      console.error('Error loading incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: Incident['status']) => {
    if (!incident) return;

    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('incidents')
        .update(updates)
        .eq('id', incident.id);

      if (error) throw error;

      setIncident({ ...incident, status: newStatus, resolvedAt: updates.resolved_at });
    } catch (error) {
      console.error('Error updating incident:', error);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading incident...</p>
        </div>
      </AppShell>
    );
  }

  if (!incident) {
    return (
      <AppShell>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Incident not found</p>
          <Button className="mt-4" onClick={() => router.push('/incidents')}>
            Back to Incidents
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/incidents')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Incidents
        </Button>

        <IncidentDetail
          incident={incident}
          onStatusChange={handleStatusChange}
          onAssign={() => console.log('Assign incident')}
        />

        <CityMap
          markers={[
            {
              id: incident.id,
              position: [incident.location.lat, incident.location.lng],
              title: incident.title,
              description: incident.description,
              type: incident.type,
              status: incident.severity,
            },
          ]}
          center={[incident.location.lat, incident.location.lng]}
          zoom={15}
        />
      </div>
    </AppShell>
  );
}
