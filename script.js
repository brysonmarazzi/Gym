const API_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhk_ONvJ0fOxMGU0F5icsp1D5FZTyVTJH1l5RZrByjxzbQ_7-1oQBhE7HzCIyPNezHyMN9jEqnxONKPwoNh8PSpNMu2_qbCMC-G7F7AO5ek7zAnoG-p0frVa6wtvHtSjdoptntATXchSUrqt_2pcrCE5eUkb20YlKsVG0K-f91uyDD00Q9rYSBgzYWCpH_ouI6uATHrtB77sYIBQvoaCMSkNk3btCygnQiJWvi4WEvk_xpQq_57ZIgdjaS2HEloSn-4CwlvL0r2TerKvWDoe0uQm_sBbQ&lib=MyWYOlWcEa0--mvqglW6D-neLMPne0zxx";

// Create and show loading spinner
const loadingSpinner = document.createElement("div");
loadingSpinner.style.cssText = `
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const spinner = document.createElement("div");
spinner.style.cssText = `
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid rgb(90, 197, 110);
  border-radius: 50%;
  animation: spin 1s linear infinite;
`;

const loadingText = document.createElement("div");
loadingText.textContent = "Loading workout data...";
loadingText.style.cssText = `
  color: #666;
  font-size: 16px;
  font-weight: 500;
`;

// Add keyframes for spinner animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

loadingSpinner.appendChild(spinner);
loadingSpinner.appendChild(loadingText);
document.body.appendChild(loadingSpinner);

let workoutData = null; // Store the data globally

function createCalendarView(data) {
  const container = document.getElementById("charts");
  container.innerHTML = ''; // Clear existing content
  
  // Get all workout dates and their exercises
  const workoutDates = new Map();
  for (const day in data) {
    const exercises = data[day];
    for (const exercise in exercises) {
      const entries = exercises[exercise];
      Object.keys(entries).forEach(date => {
        // Convert date to YYYY-MM-DD format
        const formattedDate = new Date(date).toISOString().split('T')[0];
        if (!workoutDates.has(formattedDate)) {
          workoutDates.set(formattedDate, new Set());
        }
        workoutDates.get(formattedDate).add(day); // Store the workout day type instead of exercise
      });
    }
  }

  // Define workout day colors
  const workoutColors = {
    'Day1': '#FFD700', // Yellow
    'Day2': '#4A90E2', // Blue
    'Day3': '#FF6B6B', // Red
    'Day4': '#5AC56E'  // Green
  };

  // Create calendar container
  const calendarDiv = document.createElement("div");
  calendarDiv.style.cssText = `
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  `;

  // Create month navigation
  const navContainer = document.createElement("div");
  navContainer.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  `;

  const prevButton = document.createElement("button");
  prevButton.textContent = "←";
  prevButton.style.cssText = `
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 8px 16px;
    border-radius: 8px;
    transition: background-color 0.2s;
  `;
  prevButton.onmouseover = () => prevButton.style.backgroundColor = "#f5f5f5";
  prevButton.onmouseout = () => prevButton.style.backgroundColor = "transparent";

  const nextButton = document.createElement("button");
  nextButton.textContent = "→";
  nextButton.style.cssText = prevButton.style.cssText;
  nextButton.onmouseover = () => nextButton.style.backgroundColor = "#f5f5f5";
  nextButton.onmouseout = () => nextButton.style.backgroundColor = "transparent";

  // Create month header
  const monthHeader = document.createElement("div");
  monthHeader.style.cssText = `
    text-align: center;
    font-size: 24px;
    font-weight: 600;
    color: #262626;
  `;

  // Get current month
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  function updateCalendar() {
    // Update month header text
    monthHeader.textContent = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' });
    
    // Remove old grid if it exists
    const oldGrid = calendarDiv.querySelector('.calendar-grid');
    if (oldGrid) {
      oldGrid.remove();
    }

    // Create calendar grid
    const grid = document.createElement("div");
    grid.className = 'calendar-grid';
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
    `;

    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
      const dayHeader = document.createElement("div");
      dayHeader.style.cssText = `
        text-align: center;
        font-weight: 500;
        color: #666;
        padding: 8px;
      `;
      dayHeader.textContent = day;
      grid.appendChild(dayHeader);
    });

    // Get first day of month and total days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Add empty cells for days before first of month
    for (let i = 0; i < firstDay; i++) {
      const emptyCell = document.createElement("div");
      emptyCell.style.cssText = `
        aspect-ratio: 1;
        background: #f8f8f8;
        border-radius: 8px;
      `;
      grid.appendChild(emptyCell);
    }

    // Add days
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
      const hasWorkout = workoutDates.has(date);
      const workoutDays = hasWorkout ? Array.from(workoutDates.get(date)) : [];
      
      const dayCell = document.createElement("div");
      dayCell.style.cssText = `
        aspect-ratio: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        padding: 4px;
        ${hasWorkout ? `
          background: ${workoutColors[workoutDays[0]]};
          color: white;
          font-weight: 500;
        ` : `
          background: white;
          border: 1px solid #eee;
        `}
      `;

      // Add day number
      const dayNumber = document.createElement("div");
      dayNumber.textContent = day;
      dayNumber.style.cssText = `
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 2px;
      `;
      dayCell.appendChild(dayNumber);

      // Add workout day indicator
      if (hasWorkout) {
        const workoutIndicator = document.createElement("div");
        workoutIndicator.style.cssText = `
          font-size: 12px;
          opacity: 0.9;
        `;
        workoutIndicator.textContent = workoutDays[0];
        dayCell.appendChild(workoutIndicator);
      }
      
      // Add tooltip with workout details
      if (hasWorkout) {
        dayCell.title = `Workout: ${workoutDays.join(', ')}`;
      }
      
      grid.appendChild(dayCell);
    }

    calendarDiv.appendChild(grid);
  }

  // Add navigation event listeners
  prevButton.onclick = () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    updateCalendar();
  };

  nextButton.onclick = () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    updateCalendar();
  };

  navContainer.appendChild(prevButton);
  navContainer.appendChild(monthHeader);
  navContainer.appendChild(nextButton);
  calendarDiv.appendChild(navContainer);

  // Initial calendar render
  updateCalendar();
  container.appendChild(calendarDiv);
}

function createChartsView(data) {
  const container = document.getElementById("charts");
  container.innerHTML = ''; // Clear existing content
  
  for (const day in data) {
    const exercises = data[day];
    for (const exercise in exercises) {
      const entries = exercises[exercise];

      // Sort and format dates
      const rawDates = Object.keys(entries).sort((a, b) => new Date(a) - new Date(b));
      const formattedDates = rawDates.map(dateStr => {
        const parsedDate = new Date(dateStr);
        return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      const volumes = rawDates.map(date => entries[date]);

      // Create chart container
      const chartDiv = document.createElement("div");
      chartDiv.className = "chart-container";

      const canvas = document.createElement("canvas");
      canvas.id = `${day}-${exercise}`.replace(/[^a-zA-Z0-9]/g, "_");
      chartDiv.appendChild(canvas);

      const title = document.createElement("h3");
      title.textContent = `${exercise} (${day})`;
      title.style.textAlign = "center";
      chartDiv.prepend(title);

      container.appendChild(chartDiv);

      // Render chart
      new Chart(canvas, {
        type: 'line',
        data: {
          labels: formattedDates,
          datasets: [{
            label: 'Volume',
            data: volumes,
            fill: false,
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            tension: 0.2,
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              title: { display: true, text: "Date" }
            },
            y: {
              title: { display: true, text: "Volume" },
              beginAtZero: true
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }
}

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
    console.log("Data fetched successfully");
    loadingSpinner.remove();
    workoutData = data; // Store the data
    
    // Find most recent workout
    let mostRecentDate = null;
    let mostRecentWorkout = null;

    for (const day in data) {
      const exercises = data[day];
      for (const exercise in exercises) {
        const entries = exercises[exercise];
        const dates = Object.keys(entries).sort((a, b) => new Date(b) - new Date(a));
        if (dates.length > 0) {
          const latestDate = dates[0];
          if (!mostRecentDate || new Date(latestDate) > new Date(mostRecentDate)) {
            mostRecentDate = latestDate;
            mostRecentWorkout = day;
          }
        }
      }
    }

    // Create and display most recent workout info
    if (mostRecentDate) {
      // Create fixed header container
      const headerContainer = document.createElement("div");
      headerContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: white;
        padding: 16px 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        z-index: 1000;
      `;

      // Add title
      const title = document.createElement("h1");
      title.textContent = "Bryson's Workouts";
      title.style.cssText = `
        margin: 0 0 16px 0;
        text-align: center;
        font-size: 24px;
        font-weight: 600;
        color: #262626;
      `;
      headerContainer.appendChild(title);

      const recentWorkoutDiv = document.createElement("div");
      recentWorkoutDiv.className = "recent-workout";
      recentWorkoutDiv.style.cssText = `
        padding: 12px 20px;
        background: linear-gradient(145deg, #ffffff, #f5f7fa);
        margin: 0 auto;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 400px;
      `;
      
      const formattedDate = new Date(mostRecentDate).toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric'
      });
      
      recentWorkoutDiv.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="
              background: #4a90e2;
              color: white;
              padding: 8px 12px;
              border-radius: 8px;
              font-weight: 500;
              font-size: 0.9em;
            ">${formattedDate}</div>
            <div>
              <div style="font-size: 0.85em; color: #666; margin-bottom: 2px; text-align: center;">Last Workout</div>
              <div style="font-weight: 600; color: #333; text-align: center;">${mostRecentWorkout}</div>
            </div>
          </div>
          
          <a href="https://docs.google.com/spreadsheets/d/1hoejei9jV6anWqj2mdSdxjniOmWlZQF4or6Q35pQQwI/edit?usp=drivesdk" 
             style="
               display: inline-block;
               background: rgb(90, 197, 110);
               color: white;
               padding: 6px 12px;
               border-radius: 6px;
               text-decoration: none;
               font-size: 0.85em;
               font-weight: 500;
               transition: background-color 0.2s;
               cursor: pointer;
               min-width: 120px;
               text-align: center;
             "
             onmouseover="this.style.backgroundColor='rgb(39, 126, 55)'"
             onmouseout="this.style.backgroundColor='rgb(90, 197, 110)'">
            Go to Google Sheets
          </a>
        </div>
      `;
      
      headerContainer.appendChild(recentWorkoutDiv);
      document.body.insertBefore(headerContainer, document.getElementById("charts"));
    }

    const container = document.getElementById("charts");
    container.style.paddingTop = "100px";

    // Create and add footer
    const footer = document.createElement("div");
    footer.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid #dbdbdb;
      padding: 12px 0;
      display: flex;
      justify-content: space-around;
      align-items: center;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
    `;

    // Create three buttons
    const buttons = [
      { icon: "📊", label: "Charts", view: "charts" },
      { icon: "📅", label: "Calendar", view: "calendar" },
      { icon: "💪", label: "1RepMax", view: "max" }
    ];

    buttons.forEach(button => {
      const buttonDiv = document.createElement("div");
      buttonDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 8px;
        transition: background-color 0.2s;
      `;
      
      const iconSpan = document.createElement("span");
      iconSpan.style.cssText = `
        font-size: 24px;
        line-height: 1;
      `;
      iconSpan.textContent = button.icon;
      
      const labelSpan = document.createElement("span");
      labelSpan.style.cssText = `
        font-size: 12px;
        color: #262626;
        font-weight: 500;
      `;
      labelSpan.textContent = button.label;
      
      buttonDiv.appendChild(iconSpan);
      buttonDiv.appendChild(labelSpan);
      
      // Add hover effect
      buttonDiv.onmouseover = () => buttonDiv.style.backgroundColor = "#fafafa";
      buttonDiv.onmouseout = () => buttonDiv.style.backgroundColor = "transparent";
      
      // Add click handler
      buttonDiv.onclick = () => {
        if (button.view === "calendar") {
          createCalendarView(workoutData);
        } else if (button.view === "charts") {
          createChartsView(workoutData);
        }
        // TODO: Add 1RepMax view
      };
      
      footer.appendChild(buttonDiv);
    });

    document.body.appendChild(footer);
    
    // Show charts view by default
    createChartsView(data);
  })
  .catch(err => {
    console.error("Failed to fetch data:", err);
    document.getElementById("charts").innerHTML = "<p style='color:red;text-align:center;'>Could not load data.</p>";
  });
