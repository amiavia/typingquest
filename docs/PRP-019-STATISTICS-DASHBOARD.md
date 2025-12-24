# PRP-019: Statistics & Analytics Dashboard

**Status**: DRAFT
**Author**: Claude + Anton
**Date**: 2025-12-25
**Priority**: MEDIUM
**Estimated Effort**: 6 phases, ~60 tasks

---

## Executive Summary

This PRP introduces a comprehensive statistics and analytics dashboard for TypeBit8, providing users with detailed insights into their typing practice progress. The dashboard will visualize performance metrics over time, identify weak areas, and help users track their improvement through interactive charts and data exports.

Key features include WPM progression tracking, accuracy trends, per-key performance heatmaps, lesson analytics, and customizable time-period views (daily/weekly/monthly). All visualizations will be implemented using Recharts for consistent, responsive, and accessible data presentation.

---

## Problem Statement

### Current State

1. **Limited feedback**: Users complete lessons but have no way to track long-term progress or identify patterns in their performance.

2. **No historical data visualization**: While lesson results are stored, there's no interface to view WPM/accuracy trends over time.

3. **Missing weakness identification**: Users don't know which specific keys or lessons they struggle with most.

4. **No exportable data**: Power users cannot export their practice data for external analysis or backup.

5. **Lack of motivation tools**: Without visible progress indicators, users may lose motivation or not realize how much they've improved.

### Impact

| Issue | User Impact |
|-------|-------------|
| No progress visualization | Cannot see improvement, reduced motivation |
| Missing weak spot analysis | Inefficient practice, slower learning |
| No historical tracking | Cannot set goals or measure consistency |
| No data export | Power users cannot do custom analysis |
| Limited insights | Cannot optimize practice strategy |

### Success Criteria

- [ ] Users can view WPM progression over time with interactive line charts
- [ ] Accuracy trends are displayed with configurable time periods
- [ ] Total practice statistics show cumulative words/characters typed and time spent
- [ ] Per-key accuracy heatmap highlights strongest and weakest keys
- [ ] Lesson performance comparison identifies best and worst performing lessons
- [ ] Daily/weekly/monthly view toggles allow different time granularities
- [ ] Export functionality provides CSV/JSON data download
- [ ] Dashboard is responsive and works on mobile devices
- [ ] All charts are accessible with keyboard navigation
- [ ] Historical data is preserved and efficiently queried

---

## Proposed Solution

### Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STATISTICS DASHBOARD ARCHITECTURE                                          │
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │  Session     │    │  Aggregation │    │ Visualization│                  │
│  │  Tracking    │ →  │  Service     │ →  │  Components  │                  │
│  │  (Convex)    │    │  (computed)  │    │  (Recharts)  │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
│         │                    │                    │                         │
│         ▼                    ▼                    ▼                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │
│  │ Practice     │    │ Statistics   │    │ Interactive  │                  │
│  │ Sessions DB  │    │ Queries      │    │ Dashboard UI │                  │
│  │ - WPM        │    │ - Time range │    │ - Charts     │                  │
│  │ - Accuracy   │    │ - Aggregates │    │ - Heatmaps   │                  │
│  │ - Keys used  │    │ - Trends     │    │ - Filters    │                  │
│  │ - Timestamp  │    │              │    │ - Export     │                  │
│  └──────────────┘    └──────────────┘    └──────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Architecture / Design

#### 1. Session Data Model

Track detailed practice sessions with comprehensive metrics:

```typescript
// convex/schema.ts additions

export const practiceSession = defineTable({
  userId: v.string(),
  lessonId: v.number(),
  startTime: v.number(),        // Unix timestamp
  endTime: v.number(),          // Unix timestamp
  duration: v.number(),         // Seconds
  wpm: v.number(),              // Words per minute
  accuracy: v.number(),         // Percentage 0-100
  charactersTyped: v.number(),  // Total characters
  wordsTyped: v.number(),       // Total words
  errorsCount: v.number(),      // Number of errors
  keystrokes: v.object({        // Per-key statistics
    // key -> { correct: number, incorrect: number }
  }),
  completed: v.boolean(),       // Whether lesson was completed
  quizPassed: v.optional(v.boolean()), // If quiz was attempted
})
  .index("by_user", ["userId"])
  .index("by_user_time", ["userId", "startTime"])
  .index("by_user_lesson", ["userId", "lessonId"]);
```

#### 2. Statistics Aggregation

Compute statistics from practice sessions:

```typescript
// convex/statistics.ts

export interface StatisticsSummary {
  totalSessions: number;
  totalTimeSpent: number;      // Seconds
  totalCharacters: number;
  totalWords: number;
  averageWPM: number;
  averageAccuracy: number;
  bestWPM: number;
  bestAccuracy: number;
  currentStreak: number;        // Days
  longestStreak: number;        // Days
}

export interface WPMDataPoint {
  timestamp: number;
  wpm: number;
  accuracy: number;
  lessonId: number;
}

export interface KeyPerformance {
  key: string;
  correct: number;
  incorrect: number;
  accuracy: number;
}

export interface LessonPerformance {
  lessonId: number;
  attempts: number;
  averageWPM: number;
  averageAccuracy: number;
  bestWPM: number;
  completions: number;
}

// Query functions
export const getStatisticsSummary = query({
  args: { timeRange: v.optional(v.string()) }, // 'day' | 'week' | 'month' | 'all'
  handler: async (ctx, args) => {
    // Aggregate session data
  }
});

export const getWPMProgression = query({
  args: {
    timeRange: v.string(),
    granularity: v.optional(v.string()) // 'session' | 'day' | 'week'
  },
  handler: async (ctx, args) => {
    // Return time-series WPM data
  }
});

export const getKeyPerformance = query({
  args: { timeRange: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Aggregate keystroke data
  }
});

export const getLessonPerformance = query({
  args: { timeRange: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Aggregate by lesson
  }
});
```

#### 3. Dashboard Layout

Main dashboard structure with multiple panels:

```tsx
// src/components/Statistics/StatisticsDashboard.tsx

export const StatisticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [granularity, setGranularity] = useState<'session' | 'day' | 'week'>('session');

  return (
    <div className="statistics-dashboard">
      {/* Header with time range selector */}
      <StatisticsHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      {/* Summary cards */}
      <SummaryCards timeRange={timeRange} />

      {/* Main charts grid */}
      <div className="charts-grid">
        <WPMProgressionChart
          timeRange={timeRange}
          granularity={granularity}
        />
        <AccuracyTrendChart
          timeRange={timeRange}
        />
      </div>

      {/* Analysis panels */}
      <div className="analysis-grid">
        <KeyHeatmap timeRange={timeRange} />
        <LessonPerformanceTable timeRange={timeRange} />
      </div>

      {/* Export section */}
      <ExportDataPanel />
    </div>
  );
};
```

#### 4. Summary Cards Component

Display high-level metrics:

```tsx
// src/components/Statistics/SummaryCards.tsx

interface SummaryCardsProps {
  timeRange: TimeRange;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ timeRange }) => {
  const summary = useQuery(api.statistics.getStatisticsSummary, { timeRange });

  return (
    <div className="summary-cards">
      <MetricCard
        title="Average WPM"
        value={summary?.averageWPM}
        icon="⚡"
        trend={calculateTrend(summary?.averageWPM)}
      />
      <MetricCard
        title="Average Accuracy"
        value={summary?.averageAccuracy}
        suffix="%"
        icon="🎯"
      />
      <MetricCard
        title="Total Time"
        value={formatDuration(summary?.totalTimeSpent)}
        icon="⏱️"
      />
      <MetricCard
        title="Words Typed"
        value={summary?.totalWords?.toLocaleString()}
        icon="📝"
      />
      <MetricCard
        title="Current Streak"
        value={summary?.currentStreak}
        suffix=" days"
        icon="🔥"
      />
    </div>
  );
};
```

#### 5. WPM Progression Chart

Interactive line chart showing WPM over time:

```tsx
// src/components/Statistics/WPMProgressionChart.tsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WPMProgressionChartProps {
  timeRange: TimeRange;
  granularity: Granularity;
}

export const WPMProgressionChart: React.FC<WPMProgressionChartProps> = ({
  timeRange,
  granularity
}) => {
  const data = useQuery(api.statistics.getWPMProgression, {
    timeRange,
    granularity
  });

  return (
    <div className="chart-panel">
      <h3>WPM Progression</h3>
      <div className="granularity-selector">
        <button onClick={() => setGranularity('session')}>Per Session</button>
        <button onClick={() => setGranularity('day')}>Daily Avg</button>
        <button onClick={() => setGranularity('week')}>Weekly Avg</button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTimestamp}
          />
          <YAxis
            label={{ value: 'WPM', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            labelFormatter={formatTimestamp}
            formatter={(value) => [`${value} WPM`, 'Speed']}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="wpm"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

#### 6. Key Performance Heatmap

Visual heatmap showing per-key accuracy:

```tsx
// src/components/Statistics/KeyHeatmap.tsx

interface KeyHeatmapProps {
  timeRange: TimeRange;
}

export const KeyHeatmap: React.FC<KeyHeatmapProps> = ({ timeRange }) => {
  const keyData = useQuery(api.statistics.getKeyPerformance, { timeRange });
  const layout = useKeyboardLayout(); // Current keyboard layout

  // Calculate color intensity based on accuracy
  const getKeyColor = (key: string): string => {
    const perf = keyData?.find(k => k.key === key);
    if (!perf) return '#e0e0e0'; // No data

    if (perf.accuracy >= 95) return '#4caf50'; // Green
    if (perf.accuracy >= 85) return '#8bc34a'; // Light green
    if (perf.accuracy >= 75) return '#ffeb3b'; // Yellow
    if (perf.accuracy >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  return (
    <div className="key-heatmap">
      <h3>Key Performance Heatmap</h3>

      {/* Visual keyboard with colored keys */}
      <div className="keyboard-heatmap">
        {layout.rows.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map(key => (
              <div
                key={key}
                className="keyboard-key"
                style={{ backgroundColor: getKeyColor(key) }}
                title={getKeyTooltip(key, keyData)}
              >
                {key}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span><span style={{backgroundColor: '#4caf50'}}></span> 95%+</span>
        <span><span style={{backgroundColor: '#8bc34a'}}></span> 85-94%</span>
        <span><span style={{backgroundColor: '#ffeb3b'}}></span> 75-84%</span>
        <span><span style={{backgroundColor: '#ff9800'}}></span> 60-74%</span>
        <span><span style={{backgroundColor: '#f44336'}}></span> &lt;60%</span>
      </div>

      {/* Weakest keys list */}
      <div className="weakest-keys">
        <h4>Keys to Practice</h4>
        <ul>
          {getWeakestKeys(keyData, 5).map(key => (
            <li key={key.key}>
              <strong>{key.key}</strong>: {key.accuracy.toFixed(1)}% accuracy
              <small>({key.correct} correct, {key.incorrect} errors)</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
```

#### 7. Lesson Performance Table

Compare performance across different lessons:

```tsx
// src/components/Statistics/LessonPerformanceTable.tsx

interface LessonPerformanceTableProps {
  timeRange: TimeRange;
}

export const LessonPerformanceTable: React.FC<LessonPerformanceTableProps> = ({
  timeRange
}) => {
  const lessonData = useQuery(api.statistics.getLessonPerformance, { timeRange });
  const [sortBy, setSortBy] = useState<'wpm' | 'accuracy' | 'attempts'>('wpm');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedData = useMemo(() => {
    return [...(lessonData || [])].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [lessonData, sortBy, sortOrder]);

  return (
    <div className="lesson-performance">
      <h3>Lesson Performance</h3>

      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('lessonId')}>Lesson</th>
            <th onClick={() => handleSort('attempts')}>Attempts</th>
            <th onClick={() => handleSort('wpm')}>Avg WPM</th>
            <th onClick={() => handleSort('accuracy')}>Avg Accuracy</th>
            <th>Best WPM</th>
            <th>Completions</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map(lesson => (
            <tr key={lesson.lessonId}>
              <td>Lesson {lesson.lessonId}</td>
              <td>{lesson.attempts}</td>
              <td>{lesson.averageWPM.toFixed(1)}</td>
              <td>{lesson.averageAccuracy.toFixed(1)}%</td>
              <td>{lesson.bestWPM.toFixed(1)}</td>
              <td>{lesson.completions}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Highlight best and worst */}
      <div className="performance-highlights">
        <div className="best-lesson">
          <h4>Best Performing</h4>
          <p>Lesson {getBestLesson(lessonData)?.lessonId}</p>
          <small>{getBestLesson(lessonData)?.averageWPM.toFixed(1)} WPM average</small>
        </div>
        <div className="worst-lesson">
          <h4>Needs Practice</h4>
          <p>Lesson {getWorstLesson(lessonData)?.lessonId}</p>
          <small>{getWorstLesson(lessonData)?.averageWPM.toFixed(1)} WPM average</small>
        </div>
      </div>
    </div>
  );
};
```

#### 8. Export Data Panel

Allow users to export their statistics:

```tsx
// src/components/Statistics/ExportDataPanel.tsx

export const ExportDataPanel: React.FC = () => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [includeRaw, setIncludeRaw] = useState(false);

  const handleExport = async () => {
    const data = await fetchExportData(includeRaw);

    if (format === 'csv') {
      downloadCSV(data);
    } else {
      downloadJSON(data);
    }
  };

  return (
    <div className="export-panel">
      <h3>Export Data</h3>

      <div className="export-options">
        <label>
          <input
            type="radio"
            checked={format === 'csv'}
            onChange={() => setFormat('csv')}
          />
          CSV (Spreadsheet)
        </label>
        <label>
          <input
            type="radio"
            checked={format === 'json'}
            onChange={() => setFormat('json')}
          />
          JSON (Raw Data)
        </label>
      </div>

      <div className="export-settings">
        <label>
          <input
            type="checkbox"
            checked={includeRaw}
            onChange={(e) => setIncludeRaw(e.target.checked)}
          />
          Include raw session data
        </label>
      </div>

      <button onClick={handleExport} className="export-button">
        Download Data ({format.toUpperCase()})
      </button>

      <p className="export-description">
        Export your practice statistics for external analysis or backup.
        CSV format works with Excel/Google Sheets, JSON for programming.
      </p>
    </div>
  );
};
```

### File Structure

```
src/
  components/
    Statistics/
      StatisticsDashboard.tsx       # Main dashboard container
      SummaryCards.tsx               # High-level metric cards
      WPMProgressionChart.tsx        # WPM over time line chart
      AccuracyTrendChart.tsx         # Accuracy over time chart
      KeyHeatmap.tsx                 # Per-key performance visualization
      LessonPerformanceTable.tsx     # Lesson comparison table
      ExportDataPanel.tsx            # Data export functionality
      StatisticsHeader.tsx           # Time range selector header
      MetricCard.tsx                 # Reusable metric card component
  hooks/
    useStatistics.ts                 # Statistics data fetching hook
    useExportData.ts                 # Export data preparation hook
  utils/
    statisticsFormatters.ts          # Date/number formatting utilities
    exportHelpers.ts                 # CSV/JSON export functions
  types/
    statistics.ts                    # Statistics type definitions

convex/
  statistics.ts                      # Statistics query functions
  schema.ts                          # Add practiceSession table
```

### Implementation Order

1. **Phase 1**: Schema & Data Collection
   - Update Convex schema with practiceSession table
   - Add session tracking to lesson completion flow
   - Create basic query functions

2. **Phase 2**: Core Dashboard Structure
   - Create StatisticsDashboard component
   - Implement time range selector
   - Build SummaryCards with basic metrics

3. **Phase 3**: Chart Visualizations
   - Install Recharts dependency
   - Implement WPM progression chart
   - Implement accuracy trend chart

4. **Phase 4**: Advanced Analytics
   - Build key performance heatmap
   - Create lesson performance table
   - Add weakest keys identification

5. **Phase 5**: Export Functionality
   - Implement CSV export
   - Implement JSON export
   - Add export options panel

6. **Phase 6**: Polish & Testing
   - Responsive design adjustments
   - Accessibility improvements
   - Performance optimization
   - Integration testing

---

## Files to Modify

| File | Action | Description |
|------|--------|-------------|
| `convex/schema.ts` | MODIFY | Add practiceSession table definition |
| `convex/statistics.ts` | CREATE | Statistics query functions |
| `src/components/Statistics/StatisticsDashboard.tsx` | CREATE | Main dashboard component |
| `src/components/Statistics/SummaryCards.tsx` | CREATE | Summary metric cards |
| `src/components/Statistics/MetricCard.tsx` | CREATE | Reusable metric card |
| `src/components/Statistics/WPMProgressionChart.tsx` | CREATE | WPM chart with Recharts |
| `src/components/Statistics/AccuracyTrendChart.tsx` | CREATE | Accuracy trend chart |
| `src/components/Statistics/KeyHeatmap.tsx` | CREATE | Keyboard heatmap visualization |
| `src/components/Statistics/LessonPerformanceTable.tsx` | CREATE | Lesson comparison table |
| `src/components/Statistics/ExportDataPanel.tsx` | CREATE | Data export panel |
| `src/components/Statistics/StatisticsHeader.tsx` | CREATE | Time range selector |
| `src/hooks/useStatistics.ts` | CREATE | Statistics hook |
| `src/hooks/useExportData.ts` | CREATE | Export data hook |
| `src/utils/statisticsFormatters.ts` | CREATE | Formatting utilities |
| `src/utils/exportHelpers.ts` | CREATE | CSV/JSON export helpers |
| `src/types/statistics.ts` | CREATE | Statistics types |
| `src/components/LessonView.tsx` | MODIFY | Track session data on completion |
| `src/components/Quiz.tsx` | MODIFY | Track quiz results in session |
| `src/App.tsx` | MODIFY | Add statistics route/navigation |
| `package.json` | MODIFY | Add recharts dependency |

---

## Pre-Flight Checks

> **MANDATORY**: These checks MUST pass before starting implementation.

- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds (baseline)
- [ ] `npm run dev` runs without errors
- [ ] Convex backend is connected and working
- [ ] Current lesson completion flow understood
- [ ] No TypeScript errors in codebase

---

## Implementation Tasks

### Phase 1: Schema & Data Collection

**Objective**: Set up database schema and start collecting practice session data.

#### Tasks
- [ ] **1.1** Add `practiceSession` table to `convex/schema.ts`
- [ ] **1.2** Add indexes for efficient querying: `by_user`, `by_user_time`, `by_user_lesson`
- [ ] **1.3** Create `convex/statistics.ts` with basic query structure
- [ ] **1.4** Create `src/types/statistics.ts` with TypeScript interfaces
- [ ] **1.5** Modify `src/components/LessonView.tsx` to track session start time
- [ ] **1.6** Modify `src/components/LessonView.tsx` to save session data on completion
- [ ] **1.7** Modify `src/components/Quiz.tsx` to include quiz results in session data
- [ ] **1.8** Implement keystroke tracking for per-key statistics
- [ ] **1.9** Test session data is correctly saved to Convex
- [ ] **1.10** Verify data appears in Convex dashboard

#### Build Gate
```bash
npm run build
npm run dev
# Verify no TypeScript errors
# Verify session data saves correctly
```

#### Phase Completion
```
<promise>PRP-019 PHASE 1 COMPLETE</promise>
```

---

### Phase 2: Core Dashboard Structure

**Objective**: Create the main dashboard layout and summary metrics.

#### Tasks
- [ ] **2.1** Create `src/components/Statistics/` directory
- [ ] **2.2** Create `StatisticsDashboard.tsx` with basic layout
- [ ] **2.3** Create `StatisticsHeader.tsx` with time range selector (Day/Week/Month/All)
- [ ] **2.4** Implement `getStatisticsSummary` query in `convex/statistics.ts`
- [ ] **2.5** Create `src/hooks/useStatistics.ts` hook
- [ ] **2.6** Create `MetricCard.tsx` reusable component
- [ ] **2.7** Create `SummaryCards.tsx` with 5 metric cards
- [ ] **2.8** Display: Average WPM, Average Accuracy, Total Time, Words Typed, Current Streak
- [ ] **2.9** Add route/navigation to dashboard in `App.tsx`
- [ ] **2.10** Create basic CSS styling for dashboard grid layout
- [ ] **2.11** Implement time range filtering logic
- [ ] **2.12** Test dashboard displays with mock data
- [ ] **2.13** Test time range switching updates data

#### Build Gate
```bash
npm run build
npm run dev
# Verify dashboard renders
# Verify time range selector works
```

#### Phase Completion
```
<promise>PRP-019 PHASE 2 COMPLETE</promise>
```

---

### Phase 3: Chart Visualizations

**Objective**: Add interactive charts for WPM and accuracy trends.

#### Tasks
- [ ] **3.1** Install Recharts: `npm install recharts`
- [ ] **3.2** Implement `getWPMProgression` query in `convex/statistics.ts`
- [ ] **3.3** Implement `getAccuracyTrend` query in `convex/statistics.ts`
- [ ] **3.4** Create `WPMProgressionChart.tsx` with Recharts LineChart
- [ ] **3.5** Add granularity selector (Per Session / Daily Avg / Weekly Avg)
- [ ] **3.6** Implement data aggregation for different granularities
- [ ] **3.7** Create `AccuracyTrendChart.tsx` with accuracy over time
- [ ] **3.8** Add custom tooltips with formatted timestamps
- [ ] **3.9** Create `src/utils/statisticsFormatters.ts` for date/number formatting
- [ ] **3.10** Style charts with consistent theme colors
- [ ] **3.11** Make charts responsive with ResponsiveContainer
- [ ] **3.12** Add loading states for chart data
- [ ] **3.13** Handle empty data state gracefully
- [ ] **3.14** Test charts with various data ranges

#### Build Gate
```bash
npm run build
npm run dev
# Verify charts render correctly
# Verify granularity switching works
```

#### Phase Completion
```
<promise>PRP-019 PHASE 3 COMPLETE</promise>
```

---

### Phase 4: Advanced Analytics

**Objective**: Implement key heatmap and lesson performance analysis.

#### Tasks
- [ ] **4.1** Implement `getKeyPerformance` query in `convex/statistics.ts`
- [ ] **4.2** Implement `getLessonPerformance` query in `convex/statistics.ts`
- [ ] **4.3** Create `KeyHeatmap.tsx` component
- [ ] **4.4** Build visual keyboard layout based on current keyboard setting
- [ ] **4.5** Implement color coding logic (green=95%+, yellow=75-84%, red=<60%)
- [ ] **4.6** Add heatmap legend
- [ ] **4.7** Display "Weakest Keys" list showing bottom 5 keys
- [ ] **4.8** Add tooltips showing detailed stats on hover
- [ ] **4.9** Create `LessonPerformanceTable.tsx` component
- [ ] **4.10** Implement sortable table columns
- [ ] **4.11** Display: Lesson number, Attempts, Avg WPM, Avg Accuracy, Best WPM, Completions
- [ ] **4.12** Highlight best performing lesson
- [ ] **4.13** Highlight lesson needing most practice
- [ ] **4.14** Style table with hover effects and clear headers
- [ ] **4.15** Test with multiple lessons and varied performance data

#### Build Gate
```bash
npm run build
npm run dev
# Verify heatmap colors correctly
# Verify table sorting works
```

#### Phase Completion
```
<promise>PRP-019 PHASE 4 COMPLETE</promise>
```

---

### Phase 5: Export Functionality

**Objective**: Allow users to export their statistics data.

#### Tasks
- [ ] **5.1** Create `ExportDataPanel.tsx` component
- [ ] **5.2** Add format selector (CSV / JSON radio buttons)
- [ ] **5.3** Add "Include raw session data" checkbox option
- [ ] **5.4** Create `src/utils/exportHelpers.ts` with export functions
- [ ] **5.5** Implement `exportToCSV()` function
- [ ] **5.6** CSV columns: Date, Lesson, WPM, Accuracy, Duration, Characters, Words, Errors
- [ ] **5.7** Implement `exportToJSON()` function
- [ ] **5.8** Create `src/hooks/useExportData.ts` hook
- [ ] **5.9** Fetch all session data for authenticated user
- [ ] **5.10** Generate downloadable file with proper MIME type
- [ ] **5.11** Trigger browser download on export button click
- [ ] **5.12** Add loading state during export preparation
- [ ] **5.13** Test CSV export opens correctly in Excel/Google Sheets
- [ ] **5.14** Test JSON export is valid and complete
- [ ] **5.15** Handle large datasets efficiently (streaming if needed)

#### Build Gate
```bash
npm run build
npm run dev
# Verify CSV export works
# Verify JSON export works
```

#### Phase Completion
```
<promise>PRP-019 PHASE 5 COMPLETE</promise>
```

---

### Phase 6: Polish & Testing

**Objective**: Ensure responsive design, accessibility, and optimal performance.

#### Tasks
- [ ] **6.1** Test dashboard on mobile devices (320px, 768px, 1024px)
- [ ] **6.2** Adjust chart sizing for mobile screens
- [ ] **6.3** Make summary cards stack vertically on small screens
- [ ] **6.4** Test heatmap keyboard layout on mobile
- [ ] **6.5** Add keyboard navigation support for time range selector
- [ ] **6.6** Add ARIA labels to charts and interactive elements
- [ ] **6.7** Test with screen reader (basic verification)
- [ ] **6.8** Optimize query performance with proper indexing
- [ ] **6.9** Add data pagination if session count is very high
- [ ] **6.10** Implement query result memoization where appropriate
- [ ] **6.11** Add error boundaries for chart components
- [ ] **6.12** Handle edge cases: no data, single session, gaps in timeline
- [ ] **6.13** Test with different user accounts and data volumes
- [ ] **6.14** Verify all charts update correctly when time range changes
- [ ] **6.15** Cross-browser testing (Chrome, Firefox, Safari)
- [ ] **6.16** Performance profiling with React DevTools
- [ ] **6.17** Final visual polish and consistent spacing
- [ ] **6.18** Add helpful empty states with prompts to start practicing

#### Build Gate
```bash
npm run build
npm run dev
# Test on multiple devices/browsers
# Verify no performance issues
# Verify no accessibility errors
```

#### Phase Completion
```
<promise>PRP-019 PHASE 6 COMPLETE</promise>
```

---

## Final Verification

- [ ] All phase promises output (Phases 1-6)
- [ ] `npm run build` passes
- [ ] Dashboard displays all components correctly
- [ ] Charts render with real session data
- [ ] Time range filtering works correctly
- [ ] Key heatmap shows accurate data
- [ ] Lesson performance table sorts properly
- [ ] Export to CSV and JSON both work
- [ ] Responsive on mobile and desktop
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Keyboard navigation works
- [ ] Data queries are performant
- [ ] Changes committed with descriptive message

---

## Final Completion

When ALL of the above are complete:
```
<promise>PRP-019 COMPLETE</promise>
```

---

## Notes

### Recharts Configuration

Install with:
```bash
npm install recharts
```

Key components to use:
- `LineChart` - For WPM/accuracy progression
- `ResponsiveContainer` - For responsive sizing
- `Tooltip` - For interactive data display
- `XAxis/YAxis` - For axis configuration
- `CartesianGrid` - For background grid

### Performance Considerations

1. **Query Optimization**
   - Use proper indexes on `practiceSession` table
   - Limit query results with time range filters
   - Consider pagination for very large datasets

2. **Data Aggregation**
   - Compute aggregates server-side in Convex queries
   - Cache computed statistics where possible
   - Use granularity to reduce data points (e.g., daily averages)

3. **Chart Performance**
   - Limit data points to reasonable amount (e.g., 100-200 points)
   - Use memoization for expensive calculations
   - Implement virtualization for large tables

### Accessibility Requirements

- All charts must have text alternatives
- Color heatmap must also show text/patterns for colorblind users
- Keyboard navigation for all interactive elements
- ARIA labels for screen readers
- Focus indicators visible on all controls

### Future Enhancements

- [ ] Goal setting (target WPM/accuracy)
- [ ] Progress badges and achievements
- [ ] Comparison with other users (percentile ranking)
- [ ] Predicted time to reach goals
- [ ] Practice recommendations based on weak areas
- [ ] Detailed session history view (clickable data points)
- [ ] Custom date range picker
- [ ] Print-friendly statistics report

---

## References

- Recharts documentation: https://recharts.org/
- Convex queries: https://docs.convex.dev/database/queries
- React accessibility: https://react.dev/learn/accessibility

---

## Changelog

| Date | Author | Changes |
|------|--------|---------|
| 2025-12-25 | Claude + Anton | Initial draft |

---
