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
const GYM_OCCUPANCY: OccupancyData = {
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
  'Boulderwelt West': {
    0: [
      // Sunday - Opening: 8am-11pm (hours 8-23)
      // From screenshot: Starts around 8-9am, peak at 3pm-5pm, declines after 6pm
      0, 0, 0, 0, 0, 0, 0, 0, // 0-7am (closed, no bars visible)
      20, 35, 55, 75, 90, 95, 100, 100, 95, 85, 75, 65, 55, 45, 30, // 8am-11pm (8-23)
      // 8am: small (20%), gradually increases, peak 3pm-5pm (100%), declines after 6pm
      0, 0, 0, 0, 0 // 12am-4am next day
    ],
    1: [
      // Monday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: Low-moderate morning, moderate 3pm, peak 6-7pm (~95%), ~75% at 8pm
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      12, 18, 25, 32, 40, 48, 55, 60, 65, 70, 75, 80, // 7am-5pm (7-17): low-moderate morning, moderate 3pm (~55%)
      85, 95, 95, 85, 75, 70, 65, 60, 50, 40, 30, // 6pm-11pm (18-23): peak 6-7pm (~95%), 8pm (~75%), then decline
      0, 0, 0, 0, 0
    ],
    2: [
      // Tuesday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: Very low start, gradual increase, moderate 3pm (~50-55%), 
      // high 6pm (~80-85%), peak 7-8pm (~90-95%), declines after 9pm
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      8, 12, 18, 25, 32, 40, 48, 55, 60, 65, 70, 75, // 7am-5pm (7-17): very low start, gradual increase, moderate 3pm (~48%)
      85, 95, 95, 90, 85, 75, 65, 55, 45, 35, 25, // 6pm-11pm (18-23): high 6pm (85%), peak 7-8pm (95%), declines
      0, 0, 0, 0, 0
    ],
    3: [
      // Wednesday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: Low-moderate morning (10-15%), moderate 3pm (25-30%), peak 6-7pm (90-95%), high 8pm (75-80%), declines 9pm+
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      12, 15, 18, 22, 28, 35, 42, 50, 58, 65, 72, 78, // 7am-5pm (7-17): low-moderate morning, moderate 3pm (~42%)
      85, 95, 95, 85, 78, 68, 58, 48, 38, 28, 18, // 6pm-11pm (18-23): peak 6-7pm (95%), high 8pm (85%), then decline
      0, 0, 0, 0, 0
    ],
    4: [
      // Thursday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: Low stable start, gradual increase, peak 7pm (100%), very high 8pm, declines 9pm+
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      10, 12, 15, 20, 28, 38, 48, 58, 68, 75, 82, 88, // 7am-5pm (7-17): low stable, then gradual to steep increase
      92, 100, 98, 90, 80, 70, 60, 50, 40, 30, 20, // 6pm-11pm (18-23): peak 7pm (100%), very high 8pm, then decline
      0, 0, 0, 0, 0
    ],
    5: [
      // Friday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: Low consistent morning, slight increase 3pm, steady increase 4-5pm, peak 6pm (100%), high 9pm, medium 10pm
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      10, 12, 14, 16, 18, 20, 22, 25, 30, 40, 55, 70, // 7am-5pm (7-17): low consistent, slight increase 3pm, steady 4-5pm
      100, 95, 90, 85, 82, 78, 72, 65, 58, 48, 38, // 6pm-11pm (18-23): peak 6pm (100%), high 9pm, medium 10pm
      0, 0, 0, 0, 0
    ],
    6: [
      // Saturday - Opening: 8am-11pm (hours 8-23)
      // From screenshot: Starts 8am, peak 11am-1pm (tallest at 12pm), decreases after 2pm, moderate until 8pm
      0, 0, 0, 0, 0, 0, 0, 0, // 0-7am (closed, no bars visible)
      30, 70, 95, 100, 95, 75, 60, 55, 58, 62, 65, 60, 50, 40, 30, // 8am-11pm (8-23)
      // 8am: short (30%), peak 11am-12pm (95-100%), tallest 12pm, decreases after 2pm, moderate until 8pm
      0, 0, 0, 0, 0 // 12am-4am next day
    ],
  },
  'Boulderwelt Ost': {
    0: [
      // Sunday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: Very low at 6am, starts 7am, peak around 12pm-2pm (90-95%), declines after 6pm
      // 7am: very small, 8am: small, 9am: moderate, 10am: high, 11am: very high, 12pm: peak (90%), 1pm: peak (95%), 2pm: very high (90%), 3pm: high, 4pm: moderate-high, 5pm: moderate, declines after 6pm
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      5, 10, 20, 40, 60, 80, 90, 95, 90, 80, 70, 60, 50, 40, 30, 20, 10, // 7am-11pm (7-23)
      0, 0, 0, 0, 0
    ],
    1: [
      // Monday - Opening: 6am-11pm (hours 6-23)
      // From screenshot: 6am (~10%), 7am (~15%), 8am (~20%), 9am (~25%), 10am (~30%), 11am (~35%), 12pm (~40%), 1pm (~45%), 2pm (~50%), 3pm (~55%), 4pm (~70%), 5pm (~90%), 6pm (~95% tallest), 7pm (~85%), 8pm (~75%), 9pm (~60%)
      0, 0, 0, 0, 0, 0, // 0-5am (closed)
      10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 70, 90, // 6am-5pm (6-17): gradual increase, 3pm (55%), 4pm (70%), 5pm (90%)
      95, 85, 75, 70, 65, 60, 50, 40, 30, 20, 15, // 6pm-11pm (18-23): peak 6pm (95% tallest), 7pm (85%), 8pm (75%), 9pm (60%), then decline
      0, 0, 0, 0, 0
    ],
    2: [
      // Tuesday - Opening: 6am-11pm (hours 6-23)
      // From screenshot: Very low 6am, gradual increase, moderate-high 3-4pm, high 5pm (red bar/LIVE - less busy than usual), peak 6pm (tallest), high 7pm, declines after 8pm
      // 6am: very low, 7am: low, 8am: low-moderate, 9am: moderate, 10am: moderate, 11am: moderate-high, 12pm: moderate-high, 1pm: high, 2pm: high, 3pm: high, 4pm: high, 5pm: high (red/LIVE), 6pm: peak (tallest), 7pm: high, 8pm: moderate-high, 9pm: moderate
      0, 0, 0, 0, 0, 0, // 0-5am (closed)
      5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, // 6am-5pm (6-17): very low start, gradual increase, moderate-high 3-4pm (45-50%), high 5pm (60%)
      95, 90, 85, 75, 65, 55, 45, 35, 25, 20, 15, // 6pm-11pm (18-23): peak 6pm (95% tallest), high 7pm (90%), moderate-high 8pm (85%), moderate 9pm (75%), declines
      0, 0, 0, 0, 0
    ],
    3: [
      // Wednesday - Opening: 6am-11pm (hours 6-23)
      // From screenshot: Low 6am (~5%), gradual increase: 7am (~15%), 8am (~25%), 9am (~35%), 10am (~45%), 11am (~50%), 12pm (~55%), 1pm (~60%), 2pm (~65%), 3pm (~70%), 4pm (~75%), 5pm (~85%), peak 6pm (~95%), peak 7pm (~95%), 8pm (~85%), 9pm (~70%), 10pm (~50%), 11pm (~30%)
      0, 0, 0, 0, 0, 0, // 0-5am (closed)
      5, 15, 25, 35, 45, 50, 55, 60, 65, 70, 75, 85, // 6am-5pm (6-17): low start, gradual increase, moderate 3pm (70%), 4pm (75%), 5pm (85%)
      95, 95, 85, 70, 60, 50, 40, 30, 20, 15, 10, // 6pm-11pm (18-23): peak 6-7pm (95%), high 8pm (85%), 9pm (70%), 10pm (50%), 11pm (30%)
      0, 0, 0, 0, 0
    ],
    4: [
      // Thursday - Opening: 6am-11pm (hours 6-23)
      // From screenshot: Very low 6am, gradual increase, peak 6-7pm (tallest), dark teal at 6pm, high 8pm, declines after
      // Pattern shows gradual increase from very low to peak at 6-7pm, then decline
      0, 0, 0, 0, 0, 0, // 0-5am (closed)
      8, 12, 18, 25, 32, 40, 50, 60, 70, 78, 85, 92, // 6am-5pm (6-17): very low start, gradual to steep increase
      100, 95, 88, 80, 70, 60, 50, 40, 30, 20, 15, // 6pm-11pm (18-23): peak 6pm (100% - dark teal), peak 7pm (95%), high 8pm (88%), then decline
      0, 0, 0, 0, 0
    ],
    5: [
      // Friday - Opening: 6am-11pm (hours 6-23)
      // From screenshot: Very low 6am (~5-10%), gradual increase: 7am (~12%), 8am (~20%), 9am (~30%), 10am (~40%), 11am (~50%), 12pm (~60%), 1pm (~65%), 2pm (~70%), 3pm (~75%), very high 4pm (~85%), peak 5pm (~95%), peak 6pm (~100%), high 7pm (~85%), moderate 8pm (~75%), moderate 9pm (~50%)
      0, 0, 0, 0, 0, 0, // 0-5am (closed)
      8, 12, 20, 30, 40, 50, 60, 65, 70, 75, 85, 95, // 6am-5pm (6-17): very low start, gradual increase, very high 4pm (85%), peak 5pm (95%)
      100, 95, 85, 75, 70, 65, 60, 50, 40, 30, 20, // 6pm-11pm (18-23): peak 6pm (100%), high 7pm (85%), moderate 8pm (75%), moderate 9pm (50%)
      0, 0, 0, 0, 0
    ],
    6: [
      // Saturday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: No bars at 6am, starts 7am, very small 8am (~10%), gradual increase: 9am (~20%), 10am (~40%), 11am (~60%), peak 12pm (~80%), peak 1pm (~90%), peak 2pm (~95%), very high 3pm (~95%), high 4pm (~90%), moderate-high 5pm (~80%), moderate 6pm (~60%), moderate 7pm (~40%), low-moderate 8pm (~25%), low 9pm (~10%), very low 10pm (~5%)
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      5, 10, 20, 40, 60, 80, 90, 95, 95, 90, 80, 60, 40, 25, 15, 10, 5, // 7am-11pm (7-23)
      0, 0, 0, 0, 0
    ],
  },
  'DAV Thalkirchen': {
    0: [
      // Sunday - Opening: 8am-11pm (hours 8-23)
      // From screenshot: Very low 7-8am, rises 9am, continues increasing 10-11am, high 12pm, remains high 1-3pm, PEAK 4pm (tallest), very high 5pm, declines 6pm, continues decreasing 7-8pm, low-moderate 9pm
      // Sunday is BUSIER than Saturday - taller bars overall, higher peak
      0, 0, 0, 0, 0, 0, 0, 0, // 0-7am (closed)
      15, 25, 40, 55, 70, 80, 85, 90, 95, 92, 88, 80, 70, 60, 50, 40, // 8am-11pm (8-23)
      // 8am: low (15%), 9am: moderate (25%), 10am: high (40%), 11am: very high (55%), 12pm: high (70%), 
      // 1-3pm: very high (80-85%), PEAK 4pm (95% - tallest), 5pm: very high (92%), 6pm: high (88%), 
      // 7pm: moderate-high (80%), 8pm: moderate (70%), 9pm: low-moderate (60%), 10pm: low (50%), 11pm: low (40%)
      0, 0, 0, 0, 0
    ],
    1: [
      // Monday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: Low 6am (if open), very low through morning, gradual increase, continues rising afternoon, significant surge starting 3pm, peak 6-7pm (two tallest bars), declines 8-9pm
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      8, 12, 18, 25, 32, 40, 48, 55, 62, 70, 78, 85, // 7am-5pm (7-17): very low start, gradual increase, significant surge from 3pm
      92, 95, 88, 80, 72, 65, 58, 50, 42, 35, 28, // 6pm-11pm (18-23): peak 6-7pm (95% and 92%), declines after 7pm
      0, 0, 0, 0, 0
    ],
    2: [
      // Tuesday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: Very low 6am-2pm (consistently low), gradual increase 3pm, high 5pm (red bar/LIVE - "A little busy"), peak 6-7pm (tallest bars - very high), gradually decreases after 7pm, medium-high 9pm
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      5, 8, 10, 12, 15, 18, 22, 28, 35, 42, 50, 65, // 7am-5pm (7-17): consistently very low, gradual increase 3pm, high 5pm (65%)
      90, 95, 88, 80, 72, 65, 58, 50, 42, 35, 28, // 6pm-11pm (18-23): peak 6pm (95%), peak 7pm (90%), gradually decreases
      0, 0, 0, 0, 0
    ],
    3: [
      // Wednesday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: Very low morning, gradual increase afternoon, peak 7pm (tallest - absolute peak), 8pm (second tallest), decreases after 8pm, high 9pm, moderate 10pm
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      8, 12, 18, 25, 32, 40, 48, 55, 62, 70, 78, 85, // 7am-5pm (7-17): very low start, gradual increase afternoon
      88, 95, 92, 85, 78, 70, 62, 54, 46, 38, 30, // 6pm-11pm (18-23): peak 7pm (95% - tallest), 8pm (92% - second tallest), decreases after
      0, 0, 0, 0, 0
    ],
    4: [
      // Thursday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: Very low 6am (~10%), slow steady increase morning, continues rising afternoon, more noticeable increase 3-4pm, significant jump 5pm, very high 6pm, PEAK 7pm (100% - absolute peak), very high 8pm (95%), begins decline 9pm (~75%), moderate 10pm (~60%)
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      10, 12, 15, 18, 20, 22, 25, 28, 30, 35, 45, 60, // 7am-5pm (7-17): very low start, slow steady increase, more noticeable 3-4pm, significant jump 5pm
      80, 100, 95, 88, 80, 75, 65, 55, 45, 35, 25, // 6pm-11pm (18-23): very high 6pm (80%), PEAK 7pm (100%), very high 8pm (95%), begins decline 9pm (75%)
      0, 0, 0, 0, 0
    ],
    5: [
      // Friday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: Very low at 6am, gradually increases morning and afternoon, noticeable increase from 3pm, peaks 7-8pm (7pm tallest, 8pm second), slightly lower but still high after, begins to decline after 9pm
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      8, 12, 18, 25, 32, 40, 48, 55, 62, 70, 78, 88, // 7am-5pm (7-17): very low start, gradually increases, noticeable increase from 3pm
      95, 100, 98, 92, 85, 78, 70, 62, 54, 46, 38, // 6pm-11pm (18-23): peak 7pm (100% - tallest), peak 8pm (98% - second), high after, begins decline 9pm
      0, 0, 0, 0, 0
    ],
    6: [
      // Saturday - Opening: 8am-11pm (hours 8-23)
      // From screenshot: No bars 6-7am, starts 8am with small bar, steadily increases 9-11am, peak 12pm-3pm (tallest bars), gradually decreases 4-5pm, noticeably shorter 6pm (darker teal), continues decreasing 7-10pm
      // Saturday is LESS BUSY than Sunday - lower peak, shorter bars overall
      0, 0, 0, 0, 0, 0, 0, 0, // 0-7am (closed)
      10, 18, 30, 50, 70, 85, 92, 90, 85, 78, 70, 60, 50, 40, 30, 20, // 8am-11pm (8-23)
      // 8am: small (10%), steadily increases, peak 12pm-2pm (92-85%), 3pm: very high (90%), 
      // gradually decreases 4-5pm, noticeably shorter 6pm (78%), continues decreasing, low 11pm (20%)
      0, 0, 0, 0, 0
    ],
  },
  'DAV Freimann': {
    0: [
      // Sunday - Opening: 9am-11pm (hours 9-23)
      // From screenshot: No bars 6-8am, starts 9am, gradual increase, peak 3-6pm (4pm, 5pm, 6pm tallest - 5pm darker teal), decreases after 6pm
      // Sunday should be BUSIER than Saturday - higher peak and taller bars overall
      0, 0, 0, 0, 0, 0, 0, 0, 0, // 0-8am (closed)
      15, 25, 40, 58, 75, 88, 95, 100, 98, 92, 85, 78, 70, 62, 55, // 9am-11pm (9-23)
      // 9am: low (15%), gradually increases, peak 3pm (95%), peak 4pm (100%), peak 5pm (98% - darker teal), 
      // peak 6pm (92%), decreases after 7pm
      0, 0, 0, 0, 0
    ],
    1: [
      // Monday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: No bars 6-8am, starts 9am (but opening is 7am so should start 7am), gradual increase through afternoon, peak 6-8pm (7pm tallest), decreases after 8pm
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      8, 12, 18, 25, 32, 40, 48, 55, 62, 70, 78, 85, // 7am-5pm (7-17): very low start, gradual increase
      92, 100, 95, 88, 80, 72, 65, 58, 50, 42, 35, // 6pm-11pm (18-23): peak 7pm (100% - tallest), high 8pm (95%), decreases
      0, 0, 0, 0, 0
    ],
    2: [
      // Tuesday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: Very low 6am-2pm (10-15%), increases 3pm (20%), 4pm (35% - white bar), red bar at 5pm (45% - LIVE "Less busy than usual"), peak 6pm (90-95%), high 7pm (80%), decreases 8pm (65%), 9pm (45%)
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      12, 14, 16, 18, 20, 22, 24, 28, 32, 38, 45, 55, // 7am-5pm (7-17): very low through 2pm, increases 3pm (24%), 4pm (38% - white bar), 5pm (45% - red LIVE)
      92, 85, 75, 65, 55, 45, 38, 32, 28, 22, 18, // 6pm-11pm (18-23): peak 6pm (92%), high 7pm (85%), decreases 8pm (75%), 9pm (65%)
      0, 0, 0, 0, 0
    ],
    3: [
      // Wednesday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: Low 6am-1pm, steady increase 1-6pm, peak 6-8pm (7pm tallest), decreases after 8pm
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      10, 12, 15, 18, 22, 28, 35, 42, 50, 58, 65, 75, // 7am-5pm (7-17): low start, steady increase through afternoon
      85, 95, 92, 85, 78, 70, 62, 54, 46, 38, 30, // 6pm-11pm (18-23): peak 7pm (95% - tallest), high 8pm (92%), decreases
      0, 0, 0, 0, 0
    ],
    4: [
      // Thursday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: Very low 6am (~10%), gradual increase morning, continues rising afternoon, more noticeable 3-4pm, significant jump 5pm, very high 6pm, PEAK 7pm (100% - absolute peak), very high 8pm (95%), begins decline 9pm (~75%), moderate 10pm (~60%)
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      10, 12, 15, 18, 20, 22, 25, 28, 32, 38, 48, 62, // 7am-5pm (7-17): very low start, gradual increase, more noticeable 3-4pm, significant jump 5pm
      82, 100, 95, 88, 80, 75, 65, 55, 45, 35, 25, // 6pm-11pm (18-23): very high 6pm (82%), PEAK 7pm (100%), very high 8pm (95%), begins decline 9pm (75%)
      0, 0, 0, 0, 0
    ],
    5: [
      // Friday - Opening: 7am-11pm (hours 7-23)
      // From screenshot: No bars 6-8am, starts 9am (but opening is 7am), gradual increase, peak 6-8pm (7pm tallest at 100%, 8pm second), decreases after 9pm
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      8, 12, 18, 25, 32, 40, 48, 55, 62, 70, 78, 88, // 7am-5pm (7-17): very low start, gradual increase
      95, 100, 98, 92, 85, 78, 70, 62, 54, 46, 38, // 6pm-11pm (18-23): peak 7pm (100% - tallest), peak 8pm (98%), decreases after 9pm
      0, 0, 0, 0, 0
    ],
    6: [
      // Saturday - Opening: 9am-11pm (hours 9-23)
      // From screenshot: Starts 9am, gradual increase, peak 3-6pm (5pm tallest, darker teal), decreases after 6pm
      // Saturday is LESS BUSY than Sunday - lower peak, shorter bars overall
      0, 0, 0, 0, 0, 0, 0, 0, 0, // 0-8am (closed)
      12, 22, 35, 52, 70, 85, 92, 88, 82, 75, 68, 60, 52, 45, 38, // 9am-11pm (9-23)
      // 9am: low (12%), gradually increases, peak 3pm (85%), peak 4pm (92%), peak 5pm (88% - darker teal, tallest), 
      // peak 6pm (82%), decreases after 7pm - overall lower than Sunday
      0, 0, 0, 0, 0
    ],
  },
  'Heavens Gate': {
    0: [
      // Sunday - Opening: 9am-11pm (hours 9-23)
      // Text data: 09:00-10:00 Low (10-20%), 10:00-13:00 Moderate (30-50%), 13:00-16:00 Moderate to High (40-60%), 
      // 16:00-19:00 Very High (70-90%), 19:00-22:00 High (60-80%), 22:00-23:00 Low (5-15%)
      // Peak times in afternoon and early evening, moderate to high throughout day
      0, 0, 0, 0, 0, 0, 0, 0, 0, // 0-8am (closed)
      15, 30, 40, 45, 50, 55, 60, 70, 80, 85, 80, 75, 70, 65, 10, // 9am-11pm (9-23)
      // 9am: low (15%), 10am: moderate (30%), 11am: moderate (40%), 12pm: moderate (45%), 1pm: moderate (50%), 
      // 2pm: moderate-high (55%), 3pm: moderate-high (60%), 4pm: high (70%), 
      // 5pm: very high (80%), 6pm: very high (85%), 7pm: high (80%), 8pm: high (75%), 
      // 9pm: high (70%), 10pm: high (65%), 11pm: low (10%)
      0, 0, 0, 0, 0
    ],
    1: [
      // Monday - Opening: 7am-11pm (hours 7-23)
      // Text data: 07:00-10:00 Low (10-25%), 10:00-13:00 Low to Moderate (20-40%), 13:00-16:00 Moderate (30-50%), 
      // 16:00-19:00 High (70-95%), 19:00-22:00 Very High (80-100%), 22:00-23:00 Low (5-15%)
      // Peak: 17:00-21:00 (after work hours), morning is quietest
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      15, 18, 22, 25, 30, 35, 40, 38, 36, 42, 48, 50, // 7am-4pm (7-16): low start (10-25%), low-moderate (20-40%), moderate (30-50%)
      70, 80, 90, 95, 100, 95, 10, // 5pm-11pm (17-23): high 5pm (70%), 6pm (80%), 7pm (90%), 8pm (95%), peak 9pm (100%), 10pm (95%), 11pm low (10%)
      0, 0, 0, 0, 0
    ],
    2: [
      // Tuesday - Opening: 7am-11pm (hours 7-23)
      // Same pattern as Monday (weekdays)
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      15, 18, 22, 25, 30, 35, 40, 38, 36, 42, 48, 50, // 7am-4pm (7-16)
      70, 80, 90, 95, 100, 95, 10, // 5pm-11pm (17-23): peak 17:00-21:00
      0, 0, 0, 0, 0
    ],
    3: [
      // Wednesday - Opening: 7am-11pm (hours 7-23)
      // Same pattern as Monday (weekdays)
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      15, 18, 22, 25, 30, 35, 40, 38, 36, 42, 48, 50, // 7am-4pm (7-16)
      70, 80, 90, 95, 100, 95, 10, // 5pm-11pm (17-23): peak 17:00-21:00
      0, 0, 0, 0, 0
    ],
    4: [
      // Thursday - Opening: 7am-11pm (hours 7-23)
      // Same pattern as Monday (weekdays)
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      15, 18, 22, 25, 30, 35, 40, 38, 36, 42, 48, 50, // 7am-4pm (7-16)
      70, 80, 90, 95, 100, 95, 10, // 5pm-11pm (17-23): peak 17:00-21:00
      0, 0, 0, 0, 0
    ],
    5: [
      // Friday - Opening: 7am-11pm (hours 7-23)
      // Same pattern as Monday (weekdays)
      0, 0, 0, 0, 0, 0, 0, // 0-6am (closed)
      15, 18, 22, 25, 30, 35, 40, 38, 36, 42, 48, 50, // 7am-4pm (7-16)
      70, 80, 90, 95, 100, 95, 10, // 5pm-11pm (17-23): peak 17:00-21:00
      0, 0, 0, 0, 0
    ],
    6: [
      // Saturday - Opening: 9am-11pm (hours 9-23)
      // Text data: 09:00-10:00 Low (10-20%), 10:00-13:00 Moderate (30-50%), 13:00-16:00 Moderate to High (40-60%), 
      // 16:00-19:00 Very High (70-90%), 19:00-22:00 High (60-80%), 22:00-23:00 Low (5-15%)
      // Peak times in afternoon and early evening, moderate to high throughout day
      0, 0, 0, 0, 0, 0, 0, 0, 0, // 0-8am (closed)
      15, 30, 40, 45, 50, 55, 60, 70, 80, 85, 80, 75, 70, 65, 10, // 9am-11pm (9-23)
      // Same pattern as Sunday
      0, 0, 0, 0, 0
    ],
  },
}

// Get occupancy data for a specific gym
export function getOccupancyData(gymName: string): { [dayOfWeek: number]: number[] } | null {
  // Normalize gym name for matching (case-insensitive)
  const normalizedName = gymName.trim().toLowerCase()
  
  // Try to find matching gym
  for (const [key, value] of Object.entries(GYM_OCCUPANCY)) {
    if (key.toLowerCase() === normalizedName || normalizedName.includes(key.toLowerCase())) {
      return value
    }
  }
  
  return null
}

// Get opening hours for a specific day and gym
// Returns { startHour: number, endHour: number } in 24-hour format
export function getOpeningHours(dayOfWeek: number, gymName: string = ''): { startHour: number; endHour: number } {
  // Normalize gym name for matching (case-insensitive)
  const normalizedName = gymName.trim().toLowerCase()
  
  // Boulderwelt West: weekdays 7am-11pm, weekends 8am-11pm
  if (normalizedName.includes('boulderwelt west')) {
    // Sunday = 0, Saturday = 6
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend: 8am to 11pm
      return { startHour: 8, endHour: 23 }
    } else {
      // Weekday: 7am to 11pm
      return { startHour: 7, endHour: 23 }
    }
  }
  
  // Boulderwelt Ost: weekdays 6am-11pm, weekends 7am-11pm
  if (normalizedName.includes('boulderwelt ost')) {
    // Sunday = 0, Saturday = 6
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend: 7am to 11pm
      return { startHour: 7, endHour: 23 }
    } else {
      // Weekday: 6am to 11pm
      return { startHour: 6, endHour: 23 }
    }
  }
  
  // DAV Thalkirchen: weekdays 7am-11pm, weekends 8am-11pm
  if (normalizedName.includes('dav thalkirchen') || normalizedName.includes('thalkirchen')) {
    // Sunday = 0, Saturday = 6
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend: 8am to 11pm
      return { startHour: 8, endHour: 23 }
    } else {
      // Weekday: 7am to 11pm
      return { startHour: 7, endHour: 23 }
    }
  }
  
  // DAV Freimann: weekdays 7am-11pm, weekends 9am-11pm
  if (normalizedName.includes('dav freimann') || normalizedName.includes('freimann')) {
    // Sunday = 0, Saturday = 6
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend: 9am to 11pm
      return { startHour: 9, endHour: 23 }
    } else {
      // Weekday: 7am to 11pm
      return { startHour: 7, endHour: 23 }
    }
  }
  
  // Heavens Gate: weekdays 7am-11pm, weekends 9am-11pm
  if (normalizedName.includes('heavens gate') || normalizedName.includes('heavensgate')) {
    // Sunday = 0, Saturday = 6
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend: 9am to 11pm
      return { startHour: 9, endHour: 23 }
    } else {
      // Weekday: 7am to 11pm
      return { startHour: 7, endHour: 23 }
    }
  }
  
  // Default hours for other gyms (Einstein Boulderhalle): weekdays 6am-11pm, weekends 9am-11pm
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

  // Get opening hours for this day and gym
  const { startHour, endHour } = getOpeningHours(dayOfWeek, gymName)
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

// Get chart start and end times for a specific day and gym
export function getChartTimes(dayOfWeek: number | null, gymName: string = ''): { startHour: number; endHour: number } {
  if (dayOfWeek === null) {
    const today = new Date()
    dayOfWeek = today.getDay()
  }
  return getOpeningHours(dayOfWeek, gymName)
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
  
  // Get opening hours for today and gym
  const { startHour, endHour } = getOpeningHours(dayOfWeek, gymName)
  
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

// Get current occupancy percentage for a gym (0-100)
// Returns null if no occupancy data available or gym is closed
export function getCurrentOccupancy(gymName: string): number | null {
  const occupancyData = getOccupancyData(gymName)
  if (!occupancyData) return null
  
  const now = new Date()
  const currentHour = now.getHours()
  const dayOfWeek = now.getDay()
  
  // Get opening hours for today
  const { startHour, endHour } = getOpeningHours(dayOfWeek, gymName)
  
  // Check if current time is within opening hours
  if (currentHour < startHour || currentHour > endHour) {
    return null // Gym is closed
  }
  
  const hours = occupancyData[dayOfWeek]
  if (!hours || hours.length <= currentHour) return null
  
  return hours[currentHour] || 0
}

