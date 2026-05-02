import { useEffect, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Layout from '../components/Layout';
import NotificationCard from '../components/NotificationCard';
import { fetchNotifications } from '../lib/api';
import { Log } from '../lib/logger';

const TYPE_WEIGHTS = {
  Placement: 100,
  Result: 70,
  Event: 40,
};

function recencyScore(timestamp) {
  const ageMs = Date.now() - new Date(timestamp).getTime();
  const halfLife = 6 * 60 * 60 * 1000;
  return Math.exp((-0.693 * ageMs) / halfLife) * 100;
}

function getPriorityScore(n) {
  return (TYPE_WEIGHTS[n.Type] || 0) + recencyScore(n.Timestamp);
}

function loadViewed() {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('campus_viewed');
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveViewed(ids) {
  localStorage.setItem('campus_viewed', JSON.stringify(Array.from(ids)));
}

export default function PriorityPage() {
  const [all, setAll] = useState([]);
  const [viewed, setViewed] = useState(() => loadViewed());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [limitInput, setLimitInput] = useState('10');
  const [appliedLimit, setAppliedLimit] = useState(10);
  const [appliedType, setAppliedType] = useState('All');

  const loadData = async (type) => {
    setLoading(true);
    setError('');
    try {
      Log('frontend', 'info', 'page', `Priority inbox: fetching type=${type}`);
      const typeParam = type === 'All' ? undefined : type;
      const items = await fetchNotifications({ limit: 100, page: 1, notification_type: typeParam });
      setAll(items);
      Log('frontend', 'info', 'page', `Priority inbox: received ${items.length} items`);
    } catch (err) {
      setError(err.message || 'Failed to load notifications.');
      Log('frontend', 'error', 'page', `Priority inbox error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData('All');
  }, []);

  useEffect(() => {
    saveViewed(viewed);
  }, [viewed]);

  const handleApply = () => {
    const parsed = parseInt(limitInput, 10);
    const safeLimit = !isNaN(parsed) && parsed >= 1 && parsed <= 50 ? parsed : 10;
    setAppliedLimit(safeLimit);
    setAppliedType(typeFilter);
    loadData(typeFilter);
  };

  const prioritized = useMemo(() => {
    let items = [...all];
    if (appliedType !== 'All') {
      items = items.filter((n) => n.Type === appliedType);
    }
    return items
      .sort((a, b) => getPriorityScore(b) - getPriorityScore(a))
      .slice(0, appliedLimit);
  }, [all, appliedLimit, appliedType]);

  const markRead = (id) => {
    setViewed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const unreadCount = prioritized.filter((n) => !viewed.has(n.ID)).length;

  return (
    <Layout>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Priority Inbox
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Top notifications ranked by importance and recency. Placement &gt; Result &gt; Event.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start" mb={3} flexWrap="wrap">
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Notification Type</InputLabel>
          <Select
            value={typeFilter}
            label="Notification Type"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Show top N"
          type="number"
          value={limitInput}
          onChange={(e) => setLimitInput(e.target.value)}
          inputProps={{ min: 1, max: 50 }}
          sx={{ width: 130 }}
          helperText="1 – 50"
        />

        <Button variant="contained" onClick={handleApply} disabled={loading} sx={{ mt: { xs: 0, sm: '0px' }, height: 40 }}>
          Apply
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Showing top {prioritized.length} · {unreadCount} unread — click any notification to view details
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && prioritized.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No notifications found. Try changing the type filter or increasing N.
        </Typography>
      )}

      {!loading &&
        !error &&
        prioritized.map((n, idx) => (
          <NotificationCard
            key={n.ID}
            notification={n}
            isViewed={viewed.has(n.ID)}
            onMarkViewed={markRead}
            rank={idx + 1}
          />
        ))}

      {!loading && prioritized.length > 0 && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" color="text.secondary">
            Priority score = type weight (Placement: 100 · Result: 70 · Event: 40) + recency decay over 6h half-life
          </Typography>
        </>
      )}
    </Layout>
  );
}
