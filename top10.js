// Stage 1: Priority Inbox top 10 notifications logic

const TYPE_WEIGHTS = {
  Placement: 100,
  Result: 70,
  Event: 40,
};

// Calculate Priority Score based on type weight and recency
function calculatePriorityScore(notification) {
  const typeWeight = TYPE_WEIGHTS[notification.Type] || 0;
  
  // Recency decay (6 hours half-life)
  const ageMs = Date.now() - new Date(notification.Timestamp).getTime();
  const halfLife = 6 * 60 * 60 * 1000;
  const recencyScore = Math.exp((-0.693 * ageMs) / halfLife) * 100;

  return typeWeight + recencyScore;
}

// Function to find top 10 notifications
function getTop10Notifications(notifications) {
  // Sort notifications by priority score in descending order
  const sorted = [...notifications].sort((a, b) => {
    return calculatePriorityScore(b) - calculatePriorityScore(a);
  });

  // Return top 10
  return sorted.slice(0, 10);
}

// Mock test data based on the API response sample
const mockNotifications = [
  { "ID": "1460954-0086-4334-5469-3900a14576bc", "Type": "Result", "Message": "mid-sem", "Timestamp": "2026-04-22 17:51:30" },
  { "ID": "283218f-ea5a-4b7c-9349-142424806460", "Type": "Placement", "Message": "CSX Corporation hiring", "Timestamp": "2026-04-22 17:51:18" },
  { "ID": "81589ada-8ad3-4477-9554-f52fb558e05d", "Type": "Event", "Message": "farewell", "Timestamp": "2026-04-22 17:51:06" },
  { "ID": "00055134-142b-4abc-8678-eefecbselede", "Type": "Result", "Message": "mid-sem", "Timestamp": "2026-04-22 17:50:54" },
  { "ID": "ea836726-c25e-4f21-a72f-544a6af8a37f", "Type": "Result", "Message": "project-review", "Timestamp": "2026-04-22 17:50:42" },
  { "ID": "003cb427-8fc6-47f7-bb00-be228f6b0d2c", "Type": "Result", "Message": "external", "Timestamp": "2026-04-22 17:50:30" },
  { "ID": "e5c4ff20-31bf-4040-8f02-72fda59e8918", "Type": "Result", "Message": "project-review", "Timestamp": "2026-04-22 17:50:18" },
  { "ID": "1cfce8ee-ad37-4894-8946-4787627176a5", "Type": "Event", "Message": "tech-fest", "Timestamp": "2026-04-22 17:50:06" },
  { "ID": "cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8", "Type": "Result", "Message": "project-review", "Timestamp": "2026-04-22 17:49:54" },
  { "ID": "8a7412bd-6065-4009-8501-a37f11cc848b", "Type": "Placement", "Message": "Advanced Micro Devices Inc. hiring", "Timestamp": "2026-04-22 17:49:42" }
];

console.log("--- TOP 10 PRIORITY NOTIFICATIONS ---");
const top10 = getTop10Notifications(mockNotifications);

top10.forEach((n, idx) => {
  const score = calculatePriorityScore(n).toFixed(2);
  console.log(`${idx + 1}. [${n.Type}] ${n.Message} (Score: ${score})`);
});
