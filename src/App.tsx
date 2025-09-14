import { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

interface Message {
  user: string;
  text: string;
}

function App() {
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(true);
  const [tempUsername, setTempUsername] = useState('');

  useEffect(() => {
    socket.on('chat message', (msg: Message) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('user joined', (username: string) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { user: 'System', text: `${username} has joined the chat` },
      ]);
    });

    return () => {
      socket.off('chat message');
      socket.off('user joined');
    };
  }, []);

  const handleSendMessage = () => {
    if (inputValue.trim() !== '') {
      const newMessage: Message = { user: username, text: inputValue };
      socket.emit('chat message', newMessage);
      setInputValue('');
    }
  };

  const handleJoin = () => {
    if (tempUsername.trim() !== '') {
      setUsername(tempUsername);
      setOpen(false);
      socket.emit('user joined', tempUsername);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Chat App</Typography>
        </Toolbar>
      </AppBar>
      <Container
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '16px',
        }}
      >
        <Paper
          elevation={3}
          style={{ flex: 1, overflowY: 'auto', padding: '16px' }}
        >
          <List>
            {messages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText primary={`${msg.user}: ${msg.text}`} />
              </ListItem>
            ))}
          </List>
        </Paper>
        <div style={{ display: 'flex', marginTop: '16px' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            style={{ marginLeft: '8px' }}
          >
            Send
          </Button>
        </div>
      </Container>
      <Dialog open={open} onClose={() => {}}>
        <DialogTitle>Enter Username</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleJoin();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleJoin} color="primary">
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default App;