import { useEffect, useMemo, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import Layout from '../components/Layout';
import NotificationCard from '../components/NotificationCard';
import { fetchNotifications } from '../lib/api';
import { Log } from '../lib/logger';

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

export default function AllNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [viewed, setViewed] = useState(() => loadViewed());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [tab, setTab] = useState(0);
  const mounted = useRef(false);

  const loadData = async (type) => {
    setLoading(true);
    setError('');
    try {
      Log('frontend', 'info', 'page', `All notifications page: fetching with type=${type}`);
      const typeParam = type === 'All' ? undefined : type;
      const items = await fetchNotifications({ limit: 100, page: 1, notification_type: typeParam });
      const sorted = [...items].sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
      setNotifications(sorted);
      Log('frontend', 'info', 'page', `Fetched ${sorted.length} notifications`);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      Log('frontend', 'error', 'page', `Error fetching notifications: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      loadData(typeFilter);
    }
  }, []);

  useEffect(() => {
    saveViewed(viewed);
  }, [viewed]);

  const markRead = (id) => {
    setViewed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const markAllRead = () => {
    const all = new Set(notifications.map((n) => n.ID));
    setViewed(all);
    Log('frontend', 'info', 'component', `Marked all ${notifications.length} as read`);
  };

  const unread = useMemo(() => notifications.filter((n) => !viewed.has(n.ID)), [notifications, viewed]);
  const read = useMemo(() => notifications.filter((n) => viewed.has(n.ID)), [notifications, viewed]);

  const displayed = tab === 0 ? notifications : tab === 1 ? unread : read;

  const handleTypeChange = (e) => {
    const val = e.target.value;
    setTypeFilter(val);
    loadData(val);
  };

  return (
    <Layout>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            All Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {notifications.length} total · {unread.length} unread
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" onClick={() => loadData(typeFilter)} disabled={loading}>
            Refresh
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={markAllRead}
            disabled={unread.length === 0}
          >
            Mark all read
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by type</InputLabel>
          <Select value={typeFilter} label="Filter by type" onChange={handleTypeChange}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab label={`All (${notifications.length})`} />
        <Tab label={`Unread (${unread.length})`} />
        <Tab label={`Read (${read.length})`} />
      </Tabs>

      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && displayed.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No notifications found.
        </Typography>
      )}

      {!loading && !error && displayed.map((n) => (
        <NotificationCard
          key={n.ID}
          notification={n}
          isViewed={viewed.has(n.ID)}
          onMarkViewed={markRead}
        />
      ))}
    </Layout>
  );
}
