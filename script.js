const API_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhk_ONvJ0fOxMGU0F5icsp1D5FZTyVTJH1l5RZrByjxzbQ_7-1oQBhE7HzCIyPNezHyMN9jEqnxONKPwoNh8PSpNMu2_qbCMC-G7F7AO5ek7zAnoG-p0frVa6wtvHtSjdoptntATXchSUrqt_2pcrCE5eUkb20YlKsVG0K-f91uyDD00Q9rYSBgzYWCpH_ouI6uATHrtB77sYIBQvoaCMSkNk3btCygnQiJWvi4WEvk_xpQq_57ZIgdjaS2HEloSn-4CwlvL0r2TerKvWDoe0uQm_sBbQ&lib=MyWYOlWcEa0--mvqglW6D-neLMPne0zxx";

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
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
      const recentWorkoutDiv = document.createElement("div");
      recentWorkoutDiv.className = "recent-workout";
      recentWorkoutDiv.style.cssText = `
        padding: 12px 20px;
        background: linear-gradient(145deg, #ffffff, #f5f7fa);
        margin: 0 auto 20px auto;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 400px;
      `;
      
      const formattedDate = new Date(mostRecentDate).toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric'
      });
      
      recentWorkoutDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 16px; justify-content: center;">
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
      `;
      
      document.body.insertBefore(recentWorkoutDiv, document.getElementById("charts"));
    }

    const container = document.getElementById("charts");

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
  })
  .catch(err => {
    console.error("Failed to fetch data:", err);
    document.getElementById("charts").innerHTML = "<p style='color:red;text-align:center;'>Could not load data.</p>";
  });
