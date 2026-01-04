// Push Notifications Utility Library
// Handles device token registration, subscription, and management
// Uses Firebase Cloud Messaging (FCM) with Web Push API

import { getToken, deleteToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging, VAPID_KEY, isFirebaseConfigured } from './firebaseConfig';
import { requireSupabase } from './supabaseClient';

// Type definitions
export interface PushToken {
  id?: string;
  user_id: string;
  token: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  device_type: 'web' | 'ios' | 'android';
  device_name?: string;
  user_agent?: string;
  is_active: boolean;
}

export interface PushPreferences {
  user_id: string;
  enabled: boolean;
}

/**
 * Check if push notifications are supported in this browser
 */
export const isPushSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Check if running as iOS PWA (required for iOS Safari push)
 */
export const isIOSPWA = (): boolean => {
  if (typeof window === 'undefined') return false;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = (window.navigator as any).standalone ||
                       window.matchMedia('(display-mode: standalone)').matches;

  return isIOS && isStandalone;
};

/**
 * Check if iOS Safari (non-PWA) where push doesn't work
 */
export const isIOSSafariNonPWA = (): boolean => {
  if (typeof window === 'undefined') return false;

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = (window.navigator as any).standalone ||
                       window.matchMedia('(display-mode: standalone)').matches;

  return isIOS && !isStandalone;
};

/**
 * Get device type based on user agent
 */
const getDeviceType = (): 'web' | 'ios' | 'android' => {
  if (typeof window === 'undefined') return 'web';

  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'web';
};

/**
 * Get human-readable device name
 */
const getDeviceName = (): string => {
  if (typeof window === 'undefined') return 'Unknown Device';

  const ua = navigator.userAgent;
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  // Detect browser
  if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') > -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('Edge') > -1) browser = 'Edge';

  // Detect OS
  if (/iPad|iPhone|iPod/.test(ua)) os = 'iOS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/Win/.test(ua)) os = 'Windows';
  else if (/Mac/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';

  return `${browser} on ${os}`;
};

/**
 * Register service worker for push notifications
 */
const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker not supported');
  }

  // Register the service worker
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  console.log('Service Worker registered:', registration);

  // Wait for service worker to be ready
  await navigator.serviceWorker.ready;

  return registration;
};

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported');
  }

  // Check if iOS Safari non-PWA
  if (isIOSSafariNonPWA()) {
    throw new Error('Please add DAB to your home screen to enable notifications on iOS');
  }

  const permission = await Notification.requestPermission();
  return permission;
};

/**
 * Subscribe to push notifications and save token to database
 */
export const subscribeToPush = async (userId: string): Promise<PushToken | null> => {
  try {
    // Validate Firebase configuration
    if (!isFirebaseConfigured()) {
      console.error('Firebase not configured. Add Firebase env variables to .env.local');
      return null;
    }

    // Check browser support
    if (!isPushSupported()) {
      throw new Error('Push notifications not supported in this browser');
    }

    // Check iOS PWA requirement
    if (isIOSSafariNonPWA()) {
      throw new Error('Please add DAB to your home screen to enable notifications on iOS');
    }

    // Request permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Register service worker
    await registerServiceWorker();

    // Get Firebase Messaging instance
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      throw new Error('Firebase Messaging not available');
    }

    // Get FCM token
    const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (!fcmToken) {
      throw new Error('Failed to get FCM token');
    }

    console.log('FCM Token received:', fcmToken);

    // Try to get push subscription for Web Push keys (optional with FCM)
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    // If no subscription exists, create one
    if (!subscription) {
      console.log('No existing subscription, creating one...');
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_KEY,
      });
    }

    // Extract Web Push keys
    const p256dhKey = subscription.getKey('p256dh');
    const authKey = subscription.getKey('auth');

    // Use FCM endpoint as fallback
    const endpoint = subscription.endpoint || `https://fcm.googleapis.com/fcm/send/${fcmToken}`;

    // Convert keys to base64 (use placeholders if not available)
    const p256dhBase64 = p256dhKey
      ? btoa(String.fromCharCode(...new Uint8Array(p256dhKey)))
      : 'FCM_MANAGED';
    const authBase64 = authKey
      ? btoa(String.fromCharCode(...new Uint8Array(authKey)))
      : 'FCM_MANAGED';

    // Prepare token data
    const tokenData: Omit<PushToken, 'id'> = {
      user_id: userId,
      token: fcmToken,
      endpoint: endpoint,
      p256dh_key: p256dhBase64,
      auth_key: authBase64,
      device_type: getDeviceType(),
      device_name: getDeviceName(),
      user_agent: navigator.userAgent,
      is_active: true,
    };

    // Save to database
    const supabase = requireSupabase();
    const { data, error } = await supabase
      .from('push_tokens')
      .upsert(tokenData, {
        onConflict: 'user_id,endpoint',
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save push token:', error);
      throw error;
    }

    // Update preferences
    await supabase
      .from('push_preferences')
      .upsert({
        user_id: userId,
        enabled: true,
      });

    console.log('Push token saved successfully:', data);
    return data as PushToken;

  } catch (error) {
    console.error('Failed to subscribe to push:', error);
    throw error;
  }
};

/**
 * Unsubscribe from push notifications and mark tokens inactive
 */
export const unsubscribeFromPush = async (userId: string): Promise<void> => {
  const supabase = requireSupabase();

  // Try to cleanup Firebase/service worker tokens, but don't block on it
  // If these fail, we can still mark tokens as inactive in the database
  try {
    // Get Firebase Messaging instance with timeout
    const messagingPromise = getFirebaseMessaging();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firebase messaging timeout')), 5000)
    );

    const messaging = await Promise.race([messagingPromise, timeoutPromise]) as any;
    if (messaging) {
      // Delete FCM token with timeout
      const deletePromise = deleteToken(messaging);
      const deleteTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Delete token timeout')), 5000)
      );
      await Promise.race([deletePromise, deleteTimeout]);
    }
  } catch (error) {
    console.warn('Failed to delete FCM token (non-critical):', error);
    // Continue anyway - we'll mark the token inactive in database
  }

  try {
    // Unsubscribe from Web Push with timeout
    if ('serviceWorker' in navigator) {
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Service worker timeout')), 5000))
      ]) as ServiceWorkerRegistration;

      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
    }
  } catch (error) {
    console.warn('Failed to unsubscribe from Web Push (non-critical):', error);
    // Continue anyway - we'll mark the token inactive in database
  }

  // Mark all tokens as inactive in database (critical step)
  const { error: tokensError } = await supabase
    .from('push_tokens')
    .update({ is_active: false })
    .eq('user_id', userId);

  if (tokensError) {
    console.error('Failed to deactivate push tokens:', tokensError);
    throw tokensError;
  }

  // Update preferences (critical step)
  const { error: prefsError } = await supabase
    .from('push_preferences')
    .upsert({
      user_id: userId,
      enabled: false,
    });

  if (prefsError) {
    console.error('Failed to update push preferences:', prefsError);
    throw prefsError;
  }

  console.log('Unsubscribed from push successfully');
};

/**
 * Get user's push preferences
 */
export const getPushPreferences = async (userId: string): Promise<PushPreferences | null> => {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from('push_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  // If no preference exists yet, return default (disabled)
  if (error) {
    console.warn('Error fetching push preferences:', error);
    return { user_id: userId, enabled: false };
  }

  // If no row exists, return default
  if (!data) {
    return { user_id: userId, enabled: false };
  }

  return data as PushPreferences;
};

/**
 * Listen for foreground messages (when app is open)
 */
export const setupForegroundMessageListener = async (
  callback: (payload: any) => void
): Promise<(() => void) | null> => {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) return null;

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      callback(payload);
    });

    return unsubscribe;

  } catch (error) {
    console.error('Failed to setup message listener:', error);
    return null;
  }
};
