const API_URL = "https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec"; // ← Replace this

fetch(API_URL)
  .then(res => res.json())
  .then(data => {
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
