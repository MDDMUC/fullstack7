// API Route: Send Push Notification
// POST /api/push/send
// Sends a test push notification to a specific user
// PROTECTED: Requires admin authentication

import { NextRequest, NextResponse } from 'next/server';
import { requireSupabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import * as admin from 'firebase-admin';

// Admin user IDs (TODO: Move to database table or environment variable)
// For now, only authenticated users can send pushes to themselves
// Add user IDs here to grant admin access to send to any user
const ADMIN_USER_IDS = new Set<string>([
  // Add admin user IDs here, e.g.:
  // 'uuid-of-admin-user-1',
  // 'uuid-of-admin-user-2',
]);

// Initialize Firebase Admin SDK (singleton pattern)
if (!admin.apps.length) {
  // Check if service account is configured
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (serviceAccount) {
    try {
      const parsedServiceAccount = JSON.parse(serviceAccount);
      admin.initializeApp({
        credential: admin.credential.cert(parsedServiceAccount),
      });
      console.log('✅ Firebase Admin SDK initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    }
  } else {
    console.warn('⚠️ FIREBASE_SERVICE_ACCOUNT_JSON not configured. Push sending will fail.');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = requireSupabase();
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing authorization header' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId, title, message, url } = body;

    // Validate inputs
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Authorization check: User can only send to themselves unless they're an admin
    const isAdmin = ADMIN_USER_IDS.has(user.id);
    const isSelf = user.id === userId;

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: 'Forbidden: You can only send push notifications to yourself. Admin access required to send to other users.' },
        { status: 403 }
      );
    }

    // Check if Firebase Admin is initialized
    if (!admin.apps.length) {
      return NextResponse.json(
        { error: 'Firebase Admin SDK not initialized. Check server configuration.' },
        { status: 500 }
      );
    }

    // Get user's active push tokens from database
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (tokensError) {
      console.error('Failed to fetch push tokens:', tokensError);
      return NextResponse.json(
        { error: 'Failed to fetch push tokens' },
        { status: 500 }
      );
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json(
        { error: 'No active push tokens found for this user' },
        { status: 404 }
      );
    }

    // Prepare notification payload
    const notification = {
      title: title || 'DAB',
      body: message || 'You have a new notification from DAB',
    };

    const data = {
      url: url || '/',
      timestamp: new Date().toISOString(),
    };

    // Send to all active tokens
    const results = [];
    const fcmTokens = tokens.map(t => t.token);

    try {
      // Send multicast message
      const response = await admin.messaging().sendEachForMulticast({
        tokens: fcmTokens,
        notification,
        data,
        webpush: {
          notification: {
            icon: '/icons/notification.svg',
            badge: '/icons/unread-badge.svg',
            tag: 'test-notification',
            requireInteraction: false,
          },
        },
      });

      console.log(`Push sent: ${response.successCount} success, ${response.failureCount} failed`);

      // Handle failed tokens (mark as inactive)
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(fcmTokens[idx]);
            console.error(`Failed to send to token ${idx}:`, resp.error);
          }
        });

        // Mark failed tokens as inactive
        if (failedTokens.length > 0) {
          await supabase
            .from('push_tokens')
            .update({ is_active: false })
            .in('token', failedTokens);
        }
      }

      results.push({
        userId,
        tokensAttempted: fcmTokens.length,
        successCount: response.successCount,
        failureCount: response.failureCount,
      });

    } catch (sendError: any) {
      console.error('Failed to send push notification:', sendError);
      return NextResponse.json(
        { error: `Failed to send push: ${sendError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      results,
      message: `Sent to ${results[0].successCount} device(s)`,
    });

  } catch (error: any) {
    console.error('Push send API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
