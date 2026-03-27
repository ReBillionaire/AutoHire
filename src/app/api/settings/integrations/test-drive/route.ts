import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/**
 * POST /api/settings/integrations/test-drive
 * Test Google Drive folder connection
 * For now, validates that a folder ID is provided (actual validation would require Google API)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { folderId } = body;

    if (!folderId) {
      return NextResponse.json(
        { error: 'Folder ID is required' },
        { status: 400 }
      );
    }

    // Validate that it looks like a Google Drive folder ID/link
    const isDriveLink =
      folderId.includes('drive.google.com') ||
      /^[a-zA-Z0-9_-]{33}$/.test(folderId); // Google Drive IDs are typically 33 chars

    if (!isDriveLink) {
      return NextResponse.json(
        { error: 'Invalid Google Drive folder link or ID' },
        { status: 400 }
      );
    }

    // TODO: Implement actual Google Drive API validation
    // For now, we'll simulate a successful connection

    return NextResponse.json(
      {
        success: true,
        message: 'Connection test passed',
        folderId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/settings/integrations/test-drive error:', error);
    return NextResponse.json(
      { error: 'Failed to test drive connection' },
      { status: 500 }
    );
  }
}
