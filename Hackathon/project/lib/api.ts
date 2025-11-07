import { supabase } from './supabase';
import { Incident, Sensor, CCTVCamera } from './types';

export async function getIncidents() {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('reported_at', { ascending: false });

  if (error) throw error;

  return data?.map((inc): Incident => ({
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
  })) || [];
}

export async function getIncidentById(id: string) {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
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
  } as Incident;
}

export async function createIncident(incident: Omit<Incident, 'id'>) {
  const { data, error } = await supabase
    .from('incidents')
    .insert({
      title: incident.title,
      description: incident.description,
      status: incident.status,
      severity: incident.severity,
      type: incident.type,
      location: incident.location,
      reported_at: incident.reportedAt,
      resolved_at: incident.resolvedAt,
      assigned_to: incident.assignedTo,
      tags: incident.tags,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateIncident(id: string, updates: Partial<Incident>) {
  const { data, error } = await supabase
    .from('incidents')
    .update({
      title: updates.title,
      description: updates.description,
      status: updates.status,
      severity: updates.severity,
      type: updates.type,
      location: updates.location,
      resolved_at: updates.resolvedAt,
      assigned_to: updates.assignedTo,
      tags: updates.tags,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSensors() {
  const { data, error } = await supabase
    .from('sensors')
    .select('*')
    .order('name');

  if (error) throw error;

  return data?.map((sensor): Sensor => ({
    id: sensor.id,
    name: sensor.name,
    type: sensor.type,
    status: sensor.status,
    location: sensor.location,
    lastReading: sensor.last_reading,
    metrics: [],
  })) || [];
}

export async function getSensorReadings(sensorId: string, limit = 50) {
  const { data, error } = await supabase
    .from('sensor_readings')
    .select('*')
    .eq('sensor_id', sensorId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data?.map((reading) => ({
    timestamp: reading.timestamp,
    value: Number(reading.value),
  })) || [];
}

export async function getCCTVCameras() {
  const { data, error } = await supabase
    .from('cctv_cameras')
    .select('*')
    .order('name');

  if (error) throw error;

  return data?.map((cam): CCTVCamera => ({
    id: cam.id,
    name: cam.name,
    location: cam.location,
    status: cam.status,
    streamUrl: cam.stream_url,
    lastSnapshot: cam.last_snapshot,
    recordingEnabled: cam.recording_enabled,
  })) || [];
}

export async function getActiveIncidentsCount() {
  const { count, error } = await supabase
    .from('incidents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  if (error) throw error;
  return count || 0;
}

export async function getOnlineSensorsCount() {
  const { count, error } = await supabase
    .from('sensors')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'online');

  if (error) throw error;
  return count || 0;
}

export async function getOnlineCamerasCount() {
  const { count, error } = await supabase
    .from('cctv_cameras')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'online');

  if (error) throw error;
  return count || 0;
}
