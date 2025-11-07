'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { IncidentTable } from '@/components/IncidentTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Incident } from '@/lib/types';

export default function IncidentsPage() {
  const router = useRouter();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIncidents();
  }, []);

  useEffect(() => {
    filterIncidents();
  }, [incidents, searchQuery, activeTab]);

  const loadIncidents = async () => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('reported_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedIncidents: Incident[] = data.map((inc) => ({
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
      console.error('Error loading incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIncidents = () => {
    let filtered = incidents;

    if (activeTab !== 'all') {
      filtered = filtered.filter((inc) => inc.status === activeTab);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (inc) =>
          inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          inc.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredIncidents(filtered);
  };

  const getStatusCounts = () => {
    return {
      all: incidents.length,
      active: incidents.filter((i) => i.status === 'active').length,
      investigating: incidents.filter((i) => i.status === 'investigating').length,
      resolved: incidents.filter((i) => i.status === 'resolved').length,
      closed: incidents.filter((i) => i.status === 'closed').length,
    };
  };

  const counts = getStatusCounts();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Incidents</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track city incidents
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Incident
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search incidents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
            <TabsTrigger value="investigating">
              Investigating ({counts.investigating})
            </TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({counts.resolved})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({counts.closed})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === 'all' ? 'All Incidents' : `${activeTab} Incidents`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading incidents...
                  </div>
                ) : (
                  <IncidentTable
                    incidents={filteredIncidents}
                    onRowClick={(incident) => router.push(`/incidents/${incident.id}`)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
