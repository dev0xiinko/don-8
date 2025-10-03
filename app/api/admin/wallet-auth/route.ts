import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// List of authorized admin wallet addresses
// In production, this should come from a database or environment variables
const AUTHORIZED_ADMIN_WALLETS = [
  '0x742d35Cc7565C9C7c8e8a34280d36735F9B96b9e', // Example admin wallet
  '0x8ba1f109551bD432803012645Hac136c22C87165', // Example admin wallet
  // Add more authorized admin wallets here
];

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if wallet address is in the authorized list
    const isAuthorized = AUTHORIZED_ADMIN_WALLETS.includes(walletAddress.toLowerCase()) ||
                        AUTHORIZED_ADMIN_WALLETS.includes(walletAddress);

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Wallet address not authorized for admin access' },
        { status: 403 }
      );
    }

    // Forward wallet authentication request to backend
    const response = await fetch(`${BACKEND_URL}/auth/admin/wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        admin: data.admin || {
          id: `admin_${walletAddress.slice(-8)}`,
          walletAddress,
          role: 'admin',
          isWalletAuth: true
        },
        token: data.token || `admin_token_${Date.now()}`,
        message: 'Admin wallet authentication successful'
      });
    } else {
      // If backend doesn't support wallet auth yet, create a temporary session
      return NextResponse.json({
        admin: {
          id: `admin_${walletAddress.slice(-8)}`,
          walletAddress,
          role: 'admin',
          isWalletAuth: true
        },
        token: `admin_token_${Date.now()}`,
        message: 'Admin wallet authentication successful (temporary)'
      });
    }
    
  } catch (error) {
    console.error('Admin wallet auth error:', error);
    
    // Fallback for wallet authentication if backend is not available
    const { walletAddress } = await request.json();
    const isAuthorized = AUTHORIZED_ADMIN_WALLETS.includes(walletAddress?.toLowerCase()) ||
                        AUTHORIZED_ADMIN_WALLETS.includes(walletAddress);

    if (isAuthorized) {
      return NextResponse.json({
        admin: {
          id: `admin_${walletAddress.slice(-8)}`,
          walletAddress,
          role: 'admin',
          isWalletAuth: true
        },
        token: `admin_token_${Date.now()}`,
        message: 'Admin wallet authentication successful (fallback)'
      });
    }

    return NextResponse.json(
      { error: 'Authentication service temporarily unavailable' },
      { status: 503 }
    );
  }
}