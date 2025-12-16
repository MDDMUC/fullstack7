// Gym occupancy data extracted from images
// Data structure: occupancy percentage (0-100) for each hour of the day (0-23)
// For Einstein Boulderhalle

export type OccupancyData = {
  [gymName: string]: {
    [dayOfWeek: number]: number[] // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  }
}

// Occupancy data for Einstein Boulderhalle
// Each array has 24 values representing occupancy percentage (0-100) for hours 0-23
// Data extracted from: public/gyms/gym occupancy data/einstein/
//
// IMPORTANT: Replace the placeholder values below with actual data from the screenshots
// Format: [hour0, hour1, hour2, ..., hour23] where hour6 = 6am, hour9 = 9am, hour23 = 11pm
// Opening hours: Weekdays (Mon-Fri) 6am-11pm, Weekends (Sat-Sun) 9am-11pm
// Values should be 0-100 representing occupancy percentage
//
const EINSTEIN_OCCUPANCY: OccupancyData = {
  'Einstein Boulderhalle': {
    0: [
      // Sunday - Opening: 9am-11pm (hours 9-23)
      // Extracted from screenshot: No activity 6am, starts 9am, peak at 3pm-5pm, declines after
      0, 0, 0, 0, 0, 0, 0, 0, 0, // 0-8am (closed, no bars visible)
      15, 25, 40, 60, 75, 80, 80, 85, 90, 95, 100, 95, 90, 85, 75, // 9am-11pm (9-23)
      // 9am: small, 10am: slightly taller, 11am: medium, 12pm: medium-high, 1-2pm: medium-high,
      // 3pm: peak (tallest), 4-5pm: very high, 6pm: medium-high, 7pm: medium, 8pm: medium-small,
      // 9pm: small, 10pm: very small
      0, 0, 0, 0, 0 // 12am-4am next day
    ],
    1: [
      // Monday - Opening: 6am-11pm (hours 6-23)
      // Dotted line at top = 100% max, ~75% at 8pm (hour 20)
      0, 0, 0, 0, 0, 0, // 0-5am (closed)
      15, 25, 40, 55, 70, 80, 85, 90, 95, 100, 95, 90, // 6am-5pm (6-17)
      85, 80, 75, 70, 65, 60, 50, 40, 30, 20, 10, // 6pm-11pm (18-23), 8pm = 75%
      0, 0, 0, 0, 0 // 12am-4am next day
    ],
    2: [
      // Tuesday - Opening: 6am-11pm (hours 6-23)
      // From screenshot: Gradual increase 6am-2pm, moderate at 3pm (current "Not too busy"), 
      // significant increase after 3pm, 5-8pm all tall (peak period), 7-8pm highest (100%), 9pm slightly shorter, 10pm shorter
      0, 0, 0, 0, 0, 0, // 0-5am (closed)
      10, 15, 22, 30, 38, 45, 50, 55, 58, 60, 62, 65, // 6am-5pm (6-17): gradual increase, moderate at 3pm (~50%)
      90, 95, 100, 100, 95, 88, 80, 70, 60, 45, 30, // 6pm-11pm (18-23): 5pm tall (90%), 6pm tall (95%), 7-8pm highest (100%), 9pm slightly shorter (95%), 10pm shorter (88%)
      0, 0, 0, 0, 0
    ],
    3: [
      // Wednesday - Opening: 6am-11pm (hours 6-23)
      // From screenshot: Low-moderate morning, moderate 3pm (current), peak 6-7pm, high 8pm, declines 9pm+
      0, 0, 0, 0, 0, 0, // 0-5am (closed)
      12, 18, 25, 35, 45, 55, 60, 65, 70, 75, 80, 85, // 6am-5pm (6-17): low to moderate
      90, 95, 100, 95, 90, 85, 80, 70, 60, 45, 30, // 6pm-11pm (18-23): peak 6-7pm (100%), high 8pm, then decline
      0, 0, 0, 0, 0
    ],
    4: [
      // Thursday - Opening: 6am-11pm (hours 6-23)
      // From screenshot: Low stable 6-9am, gradual increase 9am-12pm, rises 12-3pm, noticeable increase 3-6pm, peak 7pm, very high 8pm, declines 9pm+
      0, 0, 0, 0, 0, 0, // 0-5am (closed)
      10, 12, 15, 20, 28, 40, 50, 60, 70, 80, 88, 95, // 6am-5pm (6-17): stable low, then gradual to steep increase
      98, 100, 95, 88, 80, 70, 55, 40, 30, 20, 12, // 6pm-11pm (18-23): peak 7pm (100%), very high 8pm, then significant decline
      0, 0, 0, 0, 0
    ],
    5: [
      // Friday - Opening: 6am-11pm (hours 6-23)
      // From screenshot: Low consistent 6am-2pm, slightly taller 3pm, steady increase 4-5pm, peak 6-8pm, high 9pm, medium 10pm
      0, 0, 0, 0, 0, 0, // 0-5am (closed)
      8, 10, 12, 15, 18, 20, 22, 25, 28, 32, 38, 45, // 6am-5pm (6-17): low and consistent, slight increase
      55, 70, 85, 95, 100, 95, 90, 80, 70, 55, 40, // 6pm-11pm (18-23): peak 6-8pm (100%), high 9pm, medium 10pm
      0, 0, 0, 0, 0
    ],
    6: [
      // Saturday - Opening: 9am-11pm (hours 9-23)
      // From screenshot: No activity 6am, starts 9am, peak 11am-1pm (tallest at 12pm), decreases after 2pm, moderate until 8pm
      0, 0, 0, 0, 0, 0, 0, 0, 0, // 0-8am (closed, no bars visible)
      25, 60, 90, 100, 95, 75, 60, 55, 60, 65, 70, 65, 55, 45, 30, // 9am-11pm (9-23)
      // 9am: short, 10am: taller, 11am: very tall, 12pm: peak (tallest), 1pm: slightly shorter, 2pm: moderately tall,
      // 3-4pm: similar moderate, 5-6pm: moderate, 7pm: moderate, 8pm: slightly shorter, 9pm: shortest
      0, 0, 0, 0, 0 // 12am-4am next day
    ],
  },
}

// Get occupancy data for a specific gym
export function getOccupancyData(gymName: string): { [dayOfWeek: number]: number[] } | null {
  // Normalize gym name for matching (case-insensitive)
  const normalizedName = gymName.trim().toLowerCase()
  
  // Try to find matching gym
  for (const [key, value] of Object.entries(EINSTEIN_OCCUPANCY)) {
    if (key.toLowerCase() === normalizedName || normalizedName.includes(key.toLowerCase())) {
      return value
    }
  }
  
  return null
}

// Get opening hours for a specific day
// Returns { startHour: number, endHour: number } in 24-hour format
export function getOpeningHours(dayOfWeek: number): { startHour: number; endHour: number } {
  // Sunday = 0, Saturday = 6
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Weekend: 9am to 11pm
    return { startHour: 9, endHour: 23 }
  } else {
    // Weekday: 6am to 11pm
    return { startHour: 6, endHour: 23 }
  }
}

// Get bar heights for a specific day of week
// dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday, or null for today
// Bar chart displays opening hours (weekdays: 6am-11pm, weekends: 9am-11pm)
// With 20 bars, each bar represents a portion of the opening hours
// Returns array of heights in pixels (assuming max height of 60px = 100% occupancy)
export function getBarHeightsForDay(gymName: string, dayOfWeek: number | null = null): number[] | null {
  const occupancyData = getOccupancyData(gymName)
  if (!occupancyData) return null

  // If dayOfWeek is null, use today
  if (dayOfWeek === null) {
    const today = new Date()
    dayOfWeek = today.getDay() // 0 = Sunday, 6 = Saturday
  }
  
  const hours = occupancyData[dayOfWeek]
  
  if (!hours || hours.length < 24) return null

  // Get opening hours for this day
  const { startHour, endHour } = getOpeningHours(dayOfWeek)
  // Calculate total hours: from startHour to endHour inclusive
  // For weekdays: 6am (6) to 11pm (23) = 18 hours
  // For weekends: 9am (9) to 11pm (23) = 15 hours
  const totalHours = endHour - startHour + 1
  const numBars = 20

  const barHeights: number[] = []
  const maxHeight = 60 // Max bar height in pixels (100% occupancy)

  // Interpolate occupancy for each bar
  for (let i = 0; i < numBars; i++) {
    // Calculate which hour this bar represents
    // Distribute bars evenly across opening hours
    const positionInRange = i / (numBars - 1) // 0 to 1 across the range
    const exactHour = startHour + (positionInRange * (totalHours - 1))
    const hourIndex = Math.floor(exactHour)
    const nextHourIndex = Math.min(23, hourIndex + 1)
    const progress = exactHour - hourIndex // Fractional part
    
    // Clamp to opening hours
    if (hourIndex < startHour || hourIndex > endHour) {
      barHeights.push(8) // Min height for closed hours
      continue
    }
    
    // Interpolate between hours
    const occupancyCurrent = hours[hourIndex] || 0
    const occupancyNext = (nextHourIndex <= endHour && nextHourIndex <= 23) ? (hours[nextHourIndex] || 0) : occupancyCurrent
    const occupancy = occupancyCurrent * (1 - progress) + occupancyNext * progress
    const height = Math.max(8, Math.min(60, (occupancy / 100) * maxHeight)) // Min 8px, max 60px
    barHeights.push(Math.round(height))
  }

  return barHeights
}

// Get chart start and end times for a specific day
export function getChartTimes(dayOfWeek: number | null): { startHour: number; endHour: number } {
  if (dayOfWeek === null) {
    const today = new Date()
    dayOfWeek = today.getDay()
  }
  return getOpeningHours(dayOfWeek)
}

// Get bar heights for current day (backward compatibility)
export function getBarHeightsForToday(gymName: string): number[] | null {
  return getBarHeightsForDay(gymName, null)
}

// Get day name from day of week number
export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[dayOfWeek] || 'Today'
}

// Get horizontal position for live indicator (in pixels)
// Chart uses opening hours (weekdays: 6am-11pm, weekends: 9am-11pm)
// Returns -1 if time is outside chart range (before opening or after closing)
export function getLiveIndicatorPosition(gymName: string): number {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const dayOfWeek = now.getDay()
  
  // Get opening hours for today
  const { startHour, endHour } = getOpeningHours(dayOfWeek)
  
  // Check if current time is within opening hours
  if (currentHour < startHour || (currentHour === endHour && currentMinute > 0) || currentHour > endHour) {
    // Outside opening hours - not in chart range
    return -1
  }
  
  // Calculate hours since opening time
  const hoursSinceStart = currentHour - startHour + currentMinute / 60
  const totalHours = endHour - startHour + 1 // +1 because we include both start and end hours
  
  // Calculate position in chart (0 to 1)
  const positionInChart = Math.min(1, Math.max(0, hoursSinceStart / totalHours))
  
  // Calculate pixel position
  const numBars = 20
  const barWidth = 10
  const gapWidth = 6
  const totalWidth = numBars * barWidth + (numBars - 1) * gapWidth
  const pixelPosition = positionInChart * totalWidth
  
  // Adjust to center the 10px wide indicator on the exact time position
  return Math.max(0, pixelPosition - 5) // Subtract half of indicator width (5px)
}

