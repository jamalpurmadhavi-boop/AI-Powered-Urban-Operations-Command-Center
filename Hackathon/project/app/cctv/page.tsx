'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CCTVCamera } from '@/lib/types';

export default function CCTVPage() {
  const [cameras, setCameras] = useState<CCTVCamera[]>([]);
  const [filteredCameras, setFilteredCameras] = useState<CCTVCamera[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCameras();
  }, []);

  useEffect(() => {
    filterCameras();
  }, [cameras, searchQuery]);

  const loadCameras = async () => {
    try {
      const { data, error } = await supabase
        .from('cctv_cameras')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const formattedCameras: CCTVCamera[] = data.map((cam) => ({
          id: cam.id,
          name: cam.name,
          location: cam.location,
          status: cam.status,
          streamUrl: cam.stream_url,
          lastSnapshot: cam.last_snapshot,
          recordingEnabled: cam.recording_enabled,
        }));
        setCameras(formattedCameras);
      }
    } catch (error) {
      console.error('Error loading cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCameras = () => {
    let filtered = cameras;

    if (searchQuery) {
      filtered = filtered.filter(
        (camera) =>
          camera.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          camera.location.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredCameras(filtered);
  };

  const getStatusCounts = () => {
    return {
      online: cameras.filter((c) => c.status === 'online').length,
      offline: cameras.filter((c) => c.status === 'offline').length,
      maintenance: cameras.filter((c) => c.status === 'maintenance').length,
    };
  };

  const counts = getStatusCounts();

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CCTV Cameras</h1>
            <p className="text-muted-foreground mt-1">
              Monitor live camera feeds across the city
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Camera
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cameras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800">
              Online: {counts.online}
            </Badge>
            <Badge variant="outline" className="bg-red-100 text-red-800">
              Offline: {counts.offline}
            </Badge>
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              Maintenance: {counts.maintenance}
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading cameras...
          </div>
        ) : filteredCameras.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">No cameras found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {filteredCameras.map((camera) => (
              <div key={camera.id} className="space-y-2">
                <VideoPlayer
                  title={camera.name}
                  streamUrl={camera.streamUrl}
                  status={camera.status}
                  lastSnapshot={camera.lastSnapshot}
                  onFullscreen={() => console.log('Fullscreen', camera.id)}
                />
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{camera.location.address}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {camera.location.lat.toFixed(4)}, {camera.location.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        Recording: {camera.recordingEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
