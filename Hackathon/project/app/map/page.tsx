'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { CityMap } from '@/components/CityMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { Incident, Sensor, CCTVCamera } from '@/lib/types';

export default function MapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [cameras, setCameras] = useState<CCTVCamera[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const [incidentsRes, sensorsRes, camerasRes] = await Promise.all([
        supabase.from('incidents').select('*').eq('status', 'active'),
        supabase.from('sensors').select('*').eq('status', 'online'),
        supabase.from('cctv_cameras').select('*').eq('status', 'online'),
      ]);

      if (incidentsRes.data) {
        setIncidents(
          incidentsRes.data.map((inc) => ({
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
          }))
        );
      }

      if (sensorsRes.data) {
        setSensors(
          sensorsRes.data.map((sensor) => ({
            id: sensor.id,
            name: sensor.name,
            type: sensor.type,
            status: sensor.status,
            location: sensor.location,
            lastReading: sensor.last_reading,
            metrics: [],
          }))
        );
      }

      if (camerasRes.data) {
        setCameras(
          camerasRes.data.map((cam) => ({
            id: cam.id,
            name: cam.name,
            location: cam.location,
            status: cam.status,
            streamUrl: cam.stream_url,
            lastSnapshot: cam.last_snapshot,
            recordingEnabled: cam.recording_enabled,
          }))
        );
      }
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  };

  const getMapMarkers = () => {
    let markers: any[] = [];

    if (activeTab === 'all' || activeTab === 'incidents') {
      markers = [
        ...markers,
        ...incidents.map((inc) => ({
          id: inc.id,
          position: [inc.location.lat, inc.location.lng] as [number, number],
          title: inc.title,
          description: inc.description,
          type: 'incident',
          status: inc.severity,
        })),
      ];
    }

    if (activeTab === 'all' || activeTab === 'sensors') {
      markers = [
        ...markers,
        ...sensors.map((sensor) => ({
          id: sensor.id,
          position: [sensor.location.lat, sensor.location.lng] as [number, number],
          title: sensor.name,
          description: `${sensor.type} sensor`,
          type: 'sensor',
          status: sensor.status,
        })),
      ];
    }

    if (activeTab === 'all' || activeTab === 'cameras') {
      markers = [
        ...markers,
        ...cameras.map((cam) => ({
          id: cam.id,
          position: [cam.location.lat, cam.location.lng] as [number, number],
          title: cam.name,
          description: 'CCTV Camera',
          type: 'camera',
          status: cam.status,
        })),
      ];
    }

    return markers;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">City Map</h1>
          <p className="text-muted-foreground mt-1">
            Real-time geospatial view of city infrastructure
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="incidents">
              Incidents
              <Badge variant="secondary" className="ml-2">
                {incidents.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="sensors">
              Sensors
              <Badge variant="secondary" className="ml-2">
                {sensors.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="cameras">
              Cameras
              <Badge variant="secondary" className="ml-2">
                {cameras.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <CityMap markers={getMapMarkers()} center={[40.7128, -74.006]} zoom={12} />
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{incidents.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Showing on map
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Online Sensors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sensors.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Actively monitoring
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Cameras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cameras.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Live streaming
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
