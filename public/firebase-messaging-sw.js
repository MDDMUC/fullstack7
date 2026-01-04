// Firebase Cloud Messaging Service Worker
// This file runs in the background to receive push notifications
// Must be served from /public directory at root path

// Import Firebase scripts (CDN version for service worker compatibility)
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration (must match src/lib/firebaseConfig.ts)
const firebaseConfig = {
  apiKey: "AIzaSyAENfPLyCXbKpVLemDxLC9q-IWpJmP1fro",
  authDomain: "dabapp-f2db7.firebaseapp.com",
  projectId: "dabapp-f2db7",
  storageBucket: "dabapp-f2db7.firebasestorage.app",
  messagingSenderId: "147744328492",
  appId: "1:147744328492:web:f4ee83fa15c0f5d6f0ba89"
};

// Initialize Firebase in service worker context
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages (when app is not in focus)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || 'DAB';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: payload.notification?.icon || '/icons/notification.svg',
    badge: '/icons/unread-badge.svg',
    tag: payload.data?.tag || 'default',
    data: payload.data,
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event.notification.data);

  event.notification.close();

  // Open the app or focus existing window
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if not already open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[firebase-messaging-sw.js] Service worker initialized');
