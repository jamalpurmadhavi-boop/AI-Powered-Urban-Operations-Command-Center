'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { SensorCard } from '@/components/SensorCard';
import { TimeSeriesChart } from '@/components/TimeSeriesChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Sensor } from '@/lib/types';

export default function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [filteredSensors, setFilteredSensors] = useState<Sensor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSensors();
  }, []);

  useEffect(() => {
    filterSensors();
  }, [sensors, searchQuery, activeTab]);

  const loadSensors = async () => {
    try {
      const { data, error } = await supabase
        .from('sensors')
        .select('*')
        .order('name');

      if (error) throw error;

      if (data) {
        const formattedSensors: Sensor[] = data.map((sensor) => ({
          id: sensor.id,
          name: sensor.name,
          type: sensor.type,
          status: sensor.status,
          location: sensor.location,
          lastReading: sensor.last_reading,
          metrics: [],
        }));
        setSensors(formattedSensors);

        if (formattedSensors.length > 0) {
          setSelectedSensor(formattedSensors[0]);
          loadSensorReadings(formattedSensors[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading sensors:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSensorReadings = async (sensorId: string) => {
    try {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('sensor_id', sensorId)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      if (data && selectedSensor) {
        const metrics = data.map((reading) => ({
          timestamp: reading.timestamp,
          value: Number(reading.value),
        }));
        setSelectedSensor({ ...selectedSensor, metrics });
      }
    } catch (error) {
      console.error('Error loading sensor readings:', error);
    }
  };

  const filterSensors = () => {
    let filtered = sensors;

    if (activeTab !== 'all') {
      filtered = filtered.filter((sensor) => sensor.type === activeTab);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (sensor) =>
          sensor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sensor.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSensors(filtered);
  };

  const getTypeCounts = () => {
    return {
      all: sensors.length,
      air_quality: sensors.filter((s) => s.type === 'air_quality').length,
      traffic: sensors.filter((s) => s.type === 'traffic').length,
      noise: sensors.filter((s) => s.type === 'noise').length,
      water: sensors.filter((s) => s.type === 'water').length,
      weather: sensors.filter((s) => s.type === 'weather').length,
    };
  };

  const counts = getTypeCounts();

  const handleSensorClick = (sensor: Sensor) => {
    setSelectedSensor(sensor);
    loadSensorReadings(sensor.id);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Sensors</h1>
            <p className="text-muted-foreground mt-1">
              Monitor city infrastructure sensors
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Sensor
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sensors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {selectedSensor && selectedSensor.metrics.length > 0 && (
          <TimeSeriesChart
            title={`${selectedSensor.name} - Recent Readings`}
            data={selectedSensor.metrics}
            yAxisLabel={selectedSensor.lastReading?.unit || 'Value'}
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="air_quality">Air Quality ({counts.air_quality})</TabsTrigger>
            <TabsTrigger value="traffic">Traffic ({counts.traffic})</TabsTrigger>
            <TabsTrigger value="noise">Noise ({counts.noise})</TabsTrigger>
            <TabsTrigger value="water">Water ({counts.water})</TabsTrigger>
            <TabsTrigger value="weather">Weather ({counts.weather})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading sensors...
              </div>
            ) : filteredSensors.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <p className="text-center text-muted-foreground">
                    No sensors found
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSensors.map((sensor) => (
                  <SensorCard
                    key={sensor.id}
                    sensor={sensor}
                    onClick={() => handleSensorClick(sensor)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
