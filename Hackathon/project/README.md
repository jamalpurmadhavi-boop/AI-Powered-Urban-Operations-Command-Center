# AI Urban Ops - Smart City Command & Control Center

A comprehensive React + Next.js dashboard for managing smart city operations, including real-time incident tracking, sensor monitoring, CCTV surveillance, and analytics.

## Features

- **Dashboard**: Real-time KPIs, incident trends, and system health monitoring
- **Interactive Map**: Geospatial view of incidents, sensors, and CCTV cameras using Leaflet
- **Incident Management**: Track, filter, and resolve city incidents with detailed views
- **Sensor Monitoring**: Monitor air quality, traffic, noise, water quality, and weather sensors
- **CCTV Surveillance**: View live camera feeds across the city
- **Analytics**: Comprehensive charts and insights with Power BI integration support
- **Settings**: User preferences, notifications, security, and system integrations

## Tech Stack

- **Framework**: Next.js 13 with App Router
- **UI**: React 18 + Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Maps**: Leaflet + React-Leaflet
- **Charts**: Recharts
- **Icons**: Lucide React
- **Authentication**: Supabase Auth

## Project Structure

```
ai-urban-ops/
├── app/                      # Next.js app directory
│   ├── analytics/           # Analytics dashboard
│   ├── cctv/                # CCTV camera feeds
│   ├── dashboard/           # Main dashboard
│   ├── incidents/           # Incident management
│   │   └── [id]/           # Individual incident detail
│   ├── login/              # Authentication
│   ├── map/                # Interactive city map
│   ├── sensors/            # Sensor monitoring
│   ├── settings/           # User settings
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/              # Reusable components
│   ├── ui/                 # shadcn/ui components
│   ├── AppShell.tsx        # Main layout wrapper
│   ├── CityMap.tsx         # Leaflet map component
│   ├── IncidentDetail.tsx  # Incident detail view
│   ├── IncidentTable.tsx   # Incident data table
│   ├── KPICard.tsx         # KPI metric card
│   ├── SensorCard.tsx      # Sensor status card
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── TimeSeriesChart.tsx # Time series charts
│   └── VideoPlayer.tsx     # CCTV video player
├── lib/                     # Utilities and configuration
│   ├── api.ts              # API functions
│   ├── supabase.ts         # Supabase client
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Helper functions
├── data/                    # Data and seeds
│   └── seed.sql            # Sample database data
├── hooks/                   # Custom React hooks
└── public/                  # Static assets
```

## Prerequisites

- Node.js 18+ and npm
- Supabase account (for database and authentication)
- Mapbox API key (optional, for advanced mapping)
- Power BI API key (optional, for analytics integration)

## Setup Instructions

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional Integrations
NEXT_PUBLIC_MAPBOX_KEY=your-mapbox-api-key
NEXT_PUBLIC_POWERBI_KEY=your-powerbi-api-key
```

### 3. Set Up Supabase Database

The database schema is automatically created via Supabase migrations. The schema includes:

- **incidents**: City incidents with location, severity, and status
- **sensors**: IoT sensors monitoring city infrastructure
- **sensor_readings**: Time-series data from sensors
- **cctv_cameras**: CCTV camera locations and streams

### 4. Seed Sample Data (Optional)

To populate the database with sample data for testing:

```sql
-- Run the contents of data/seed.sql in your Supabase SQL editor
```

This will create:
- 5 sample incidents (water main break, traffic accident, power outage, etc.)
- 5 sensors (air quality, traffic, noise, water, weather)
- Historical sensor readings (24 hours of data)
- 5 CCTV cameras at various locations

### 5. Configure Authentication

The application uses Supabase Auth with email/password authentication:

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Enable Email provider
4. (Optional) Disable email confirmation for development
5. Create a test user in Authentication → Users

**Demo Credentials** (create this user in Supabase):
- Email: demo@urbanops.city
- Password: demo123

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and navigate to `/login` to sign in.

## Building for Production

```bash
# Type check
npm run typecheck

# Build
npm run build

# Start production server
npm start
```

Note: This project uses `output: 'export'` for static export. If you need server-side features, remove this from `next.config.js`.

## Database Schema

### Incidents Table
- Tracks city incidents with geolocation
- Supports severity levels: critical, high, medium, low
- Status workflow: active → investigating → resolved → closed
- Includes tags, assignments, and timestamps

### Sensors Table
- Monitors IoT sensors across the city
- Types: air_quality, traffic, noise, water, weather
- Stores last reading and sensor status
- Linked to time-series readings table

### Sensor Readings Table
- Time-series data from sensors
- Supports metadata for additional context
- Indexed for fast querying by sensor and time

### CCTV Cameras Table
- Manages surveillance camera network
- Stores stream URLs and recording status
- Tracks camera health and availability

## API Functions

The `lib/api.ts` file provides convenient functions:

```typescript
// Incidents
getIncidents()
getIncidentById(id)
createIncident(incident)
updateIncident(id, updates)

// Sensors
getSensors()
getSensorReadings(sensorId, limit)

// CCTV
getCCTVCameras()

// Statistics
getActiveIncidentsCount()
getOnlineSensorsCount()
getOnlineCamerasCount()
```

## Key Features

### Real-Time Updates
The application uses Supabase's real-time capabilities. To enable live updates, subscribe to changes:

```typescript
const subscription = supabase
  .channel('incidents')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'incidents'
  }, payload => {
    // Handle real-time update
  })
  .subscribe();
```

### Responsive Design
- Mobile-first approach
- Responsive layouts for all screen sizes
- Touch-friendly interfaces

### Accessibility
- ARIA labels and semantic HTML
- Keyboard navigation support
- Screen reader compatible

### Security
- Row Level Security (RLS) enabled on all tables
- Authenticated user policies
- Secure API key management

## Customization

### Adding New Sensor Types
1. Update the `Sensor` type in `lib/types.ts`
2. Add icon mapping in `SensorCard.tsx`
3. Update sensor filters in `sensors/page.tsx`

### Customizing Map Styles
Edit the TileLayer URL in `CityMap.tsx` to use different map providers:
- OpenStreetMap (default)
- Mapbox (requires API key)
- Custom tile servers

### Integrating Power BI
Replace the placeholder in `analytics/page.tsx` with Power BI embed code:

```typescript
<PowerBIEmbed
  embedConfig={{
    type: 'report',
    id: 'report-id',
    embedUrl: 'embed-url',
    accessToken: process.env.NEXT_PUBLIC_POWERBI_KEY
  }}
/>
```

## Troubleshooting

### Map Not Loading
- Check that leaflet CSS is imported in `CityMap.tsx`
- Verify the component is only rendered on the client side
- Check browser console for errors

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase project status
- Ensure RLS policies are configured properly

### Build Errors
- Run `npm run typecheck` to identify TypeScript errors
- Clear `.next` directory and rebuild
- Check for missing dependencies

## Performance Optimization

- Images are optimized using Next.js Image component
- Code splitting via dynamic imports
- React Server Components for faster initial loads
- Efficient database queries with proper indexing

## Contributing

To contribute to this project:
1. Follow the existing code structure
2. Use TypeScript for type safety
3. Write clean, documented code
4. Test changes thoroughly

## License

MIT License - feel free to use this project for your smart city applications.

## Support

For issues or questions:
- Check the Supabase documentation
- Review Next.js documentation
- Check component documentation in shadcn/ui

---

Built with ❤️ for Smart Cities
