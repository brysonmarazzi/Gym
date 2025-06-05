const API_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLj2ZXF4zNoLkRtbsXeyYTmH4TRqGPglonOzqsiyFexPEb6t3LqNnJrIgraYVh1ADHr6tG8c3hm7JLavAcfdxvYjGh44-sCpoyDKyrIh7c4VC5f-eircdi2XOHsW6BVpE7aOC78mTV9iZRk2fY8VLDs7vXQjPndclH5mkF02koLnzPV9qiI5DXbLjguUiOwCTr2KXFjfN9lrc_boQWref3BFSu_mE6zoKAIBvEAeKHpr47aCOSeaFC9yoTMrakHKzDgGBo0R_hfjEi6Gplt0DK-FYYss1g&lib=MyWYOlWcEa0--mvqglW6D-neLMPne0zxx";

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
