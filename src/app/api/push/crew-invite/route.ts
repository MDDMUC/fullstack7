// API Route: Send Crew Invite Push Notification
// POST /api/push/crew-invite
// Sends a push notification when a crew owner invites a user
// PROTECTED: Requires authentication and crew ownership verification

import { NextRequest, NextResponse } from 'next/server';
import { requireSupabase } from '@/lib/supabaseClient';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (singleton pattern)
if (!admin.apps.length) {
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
    // Get base Supabase client
    const supabaseBase = requireSupabase();
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing authorization header' },
        { status: 401 }
      );
    }

    // Verify JWT token and create authenticated client
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseBase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token' },
        { status: 401 }
      );
    }

    // Create a Supabase client with the user's auth context
    // This ensures RLS policies work correctly
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Parse request body
    const body = await request.json();
    const { inviteeId, crewId, inviterName, crewName } = body;

    // Validate inputs
    if (!inviteeId || !crewId || !inviterName || !crewName) {
      return NextResponse.json(
        { error: 'Missing required fields: inviteeId, crewId, inviterName, crewName' },
        { status: 400 }
      );
    }

    // Verify that the authenticated user is the crew owner or a participant
    const { data: crew, error: crewError } = await supabase
      .from('crews')
      .select('created_by')
      .eq('id', crewId)
      .single();

    if (crewError || !crew) {
      return NextResponse.json(
        { error: 'Crew not found' },
        { status: 404 }
      );
    }

    // Check if user is the crew owner
    if (crew.created_by !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: Only the crew owner can send invitations' },
        { status: 403 }
      );
    }

    // Check if Firebase Admin is initialized
    if (!admin.apps.length) {
      console.warn('Firebase Admin SDK not initialized - notification skipped');
      return NextResponse.json(
        { success: true, message: 'Invite created but notification skipped (Firebase not configured)' },
        { status: 200 }
      );
    }

    // Get invitee's active push tokens from database
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('*')
      .eq('user_id', inviteeId)
      .eq('is_active', true);

    if (tokensError) {
      console.error('Failed to fetch push tokens:', tokensError);
      return NextResponse.json(
        { error: 'Failed to fetch push tokens' },
        { status: 500 }
      );
    }

    if (!tokens || tokens.length === 0) {
      // No tokens - user hasn't enabled push notifications
      return NextResponse.json(
        { success: true, message: 'Invite created but user has no active push tokens' },
        { status: 200 }
      );
    }

    // Prepare notification payload
    const notification = {
      title: 'Crew Invite',
      body: `${inviterName} invited you to join "${crewName}"`,
    };

    const data = {
      url: `/crew/detail?crewId=${crewId}`,
      timestamp: new Date().toISOString(),
      type: 'crew_invite',
    };

    // Send to all active tokens
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
            tag: `crew-invite-${crewId}`,
            requireInteraction: false,
          },
        },
      });

      console.log(`Crew invite push sent: ${response.successCount} success, ${response.failureCount} failed`);

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

      return NextResponse.json({
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        message: `Sent to ${response.successCount} device(s)`,
      });

    } catch (sendError: any) {
      console.error('Failed to send crew invite push notification:', sendError);
      return NextResponse.json(
        { error: `Failed to send push: ${sendError.message}` },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Crew invite push API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
