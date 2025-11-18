// server/src/socket/socketHandlers.js

// Store active subscriptions
const activeSubscriptions = new Map();

/**
 * Setup Socket.IO event handlers
 */
export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id);

    // Handle brand subscription
    socket.on('subscribe', ({ brand }) => {
      if (!brand) {
        socket.emit('error', { message: 'Brand name is required' });
        return;
      }

      console.log(`📌 Client ${socket.id} subscribed to: ${brand}`);

      if (!activeSubscriptions.has(brand)) {
        activeSubscriptions.set(brand, new Set());
      }
      activeSubscriptions.get(brand).add(socket.id);
      socket.join(brand);

      // Confirm subscription
      socket.emit('subscribed', { brand });
    });

    // Handle brand unsubscription
    socket.on('unsubscribe', ({ brand }) => {
      if (!brand) return;

      console.log(`📍 Client ${socket.id} unsubscribed from: ${brand}`);

      if (activeSubscriptions.has(brand)) {
        activeSubscriptions.get(brand).delete(socket.id);
        
        // Clean up empty subscription sets
        if (activeSubscriptions.get(brand).size === 0) {
          activeSubscriptions.delete(brand);
        }
      }
      socket.leave(brand);

      // Confirm unsubscription
      socket.emit('unsubscribed', { brand });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
      
      // Remove from all brand subscriptions
      activeSubscriptions.forEach((subscribers, brand) => {
        subscribers.delete(socket.id);
        if (subscribers.size === 0) {
          activeSubscriptions.delete(brand);
        }
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Make activeSubscriptions globally accessible
  global.activeSubscriptions = activeSubscriptions;

  console.log('💬 WebSocket handlers initialized');
}

/**
 * Get active subscriptions for a brand
 */
export function getSubscribers(brand) {
  return activeSubscriptions.get(brand) || new Set();
}

/**
 * Get all active subscriptions
 */
export function getAllSubscriptions() {
  const subscriptions = {};
  activeSubscriptions.forEach((subscribers, brand) => {
    subscriptions[brand] = subscribers.size;
  });
  return subscriptions;
}

/**
 * Check if a brand has active subscribers
 */
export function hasSubscribers(brand) {
  return activeSubscriptions.has(brand) && activeSubscriptions.get(brand).size > 0;
}