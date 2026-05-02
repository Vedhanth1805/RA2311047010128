import { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

const chipColor = {
  Placement: 'primary',
  Result: 'success',
  Event: 'warning',
};

export default function NotificationCard({ notification, isViewed, onMarkViewed, rank }) {
  const { ID, Type, Message, Timestamp } = notification;
  const [open, setOpen] = useState(false);

  const handleCardClick = () => {
    setOpen(true);
    if (!isViewed) onMarkViewed(ID);
  };

  return (
    <>
      <Card
        variant="outlined"
        onClick={handleCardClick}
        sx={{
          mb: 1.5,
          opacity: isViewed ? 0.7 : 1,
          borderLeft: isViewed ? undefined : '4px solid',
          borderLeftColor: isViewed ? undefined : 'primary.main',
          cursor: 'pointer',
          '&:hover': { boxShadow: 2 },
          transition: 'box-shadow 0.15s ease',
        }}
      >
        <CardContent sx={{ py: '12px !important' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                {rank !== undefined && (
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    #{rank}
                  </Typography>
                )}
                <Chip
                  label={Type}
                  color={chipColor[Type] || 'default'}
                  size="small"
                  variant="outlined"
                />
                {!isViewed && (
                  <Chip label="New" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem' }} />
                )}
              </Stack>
              <Typography variant="body1" fontWeight={500}>
                {Message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Timestamp}
              </Typography>
            </Stack>
            <Box onClick={(e) => e.stopPropagation()}>
              <Tooltip title={isViewed ? 'Already read' : 'Mark as read'}>
                <IconButton
                  size="small"
                  onClick={() => !isViewed && onMarkViewed(ID)}
                  color={isViewed ? 'success' : 'default'}
                >
                  {isViewed ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pr: 6 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={Type} color={chipColor[Type] || 'default'} size="small" variant="outlined" />
            <Typography variant="subtitle1" fontWeight={700}>
              Notification Detail
            </Typography>
          </Stack>
          <IconButton
            onClick={() => setOpen(false)}
            size="small"
            sx={{ position: 'absolute', right: 12, top: 12 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Message
              </Typography>
              <Typography variant="body1">{Message}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Type
              </Typography>
              <Typography variant="body2">{Type}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Timestamp
              </Typography>
              <Typography variant="body2">{Timestamp}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Notification ID
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                {ID}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
