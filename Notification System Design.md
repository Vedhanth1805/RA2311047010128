# Stage 1: Notification System Design

## Approach for Priority Inbox

The goal is to maintain and display the top 'n' (e.g., top 10) most important unread notifications based on a combination of weight and recency.

### 1. Determining Priority (Weight + Recency)
Priority is determined using a composite score:
*   **Weight (Type):** We assign a base weight to each notification type.
    *   `Placement`: 100
    *   `Result`: 70
    *   `Event`: 40
*   **Recency Decay:** Newer notifications are more important than older ones. We use an exponential decay function to reduce the score of older notifications. A half-life of 6 hours is used, meaning a notification's recency score halves every 6 hours.
*   **Total Score:** `Priority Score = Type Weight + Recency Score`

### 2. Efficiently Maintaining Top 10
When new notifications come in, maintaining the top 10 efficiently without re-sorting the entire database is crucial.
*   **Priority Queue (Min-Heap):** We use a Min-Heap data structure of size 'n' (10). 
*   As new notifications arrive, we calculate their priority score.
*   If the heap has less than 10 elements, we insert the new notification.
*   If the heap is full (10 elements), we compare the new notification's score with the minimum score in the heap (the root). If the new score is higher, we extract the minimum and insert the new notification.
*   This ensures we always maintain the top 10 notifications with an insertion time complexity of `O(log n)`.

### 3. Fetching and Filtering
*   The application fetches notifications from the API.
*   We filter out notifications that have already been viewed (tracked via local storage in the frontend).
*   The remaining unread notifications are passed through the priority scoring and sorting mechanism to present the top 10 to the user.
