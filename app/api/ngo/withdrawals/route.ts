import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const withdrawalData = await request.json();
    
    const {
      ngoId,
      amount,
      destination,
      txHash,
      fromAddress,
      timestamp,
      currency,
      network
    } = withdrawalData;
    
    // Validate required fields
    if (!ngoId || !amount || !destination || !txHash) {
      return NextResponse.json(
        { success: false, message: 'Missing required withdrawal data' },
        { status: 400 }
      );
    }
    
    // Load existing withdrawals
    const withdrawalsFilePath = path.join(process.cwd(), 'mock', 'withdrawals.json');
    let withdrawals = [];
    
    try {
      if (fs.existsSync(withdrawalsFilePath)) {
        const withdrawalsFileContent = fs.readFileSync(withdrawalsFilePath, 'utf8');
        withdrawals = JSON.parse(withdrawalsFileContent);
      }
    } catch (error) {
      console.log('Creating new withdrawals file');
      withdrawals = [];
    }
    
    // Create withdrawal record
    const withdrawalRecord = {
      id: Date.now().toString(),
      ngoId: parseInt(ngoId),
      amount: parseFloat(amount),
      currency: currency || 'SONIC',
      destination,
      fromAddress,
      txHash,
      network: network || 'Unknown',
      status: 'completed',
      timestamp: timestamp || new Date().toISOString(),
      blockchainConfirmed: false, // Will be updated when we verify on-chain
      createdAt: new Date().toISOString()
    };
    
    // Add to withdrawals
    withdrawals.push(withdrawalRecord);
    
    // Save withdrawals
    fs.writeFileSync(withdrawalsFilePath, JSON.stringify(withdrawals, null, 2));
    
    // Update NGO scoring - record withdrawal event for transparency scoring
    try {
      await fetch(`${request.nextUrl.origin}/api/ngo-scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ngoId: parseInt(ngoId),
          type: 'withdrawal',
          campaignId: 'general', 
          withdrawalAmount: parseFloat(amount),
          txHash
        })
      });
    } catch (error) {
      console.error('Error updating NGO score for withdrawal:', error);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Withdrawal recorded successfully',
      withdrawal: withdrawalRecord
    });
    
  } catch (error) {
    console.error('Error recording withdrawal:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record withdrawal' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ngoId = searchParams.get('ngoId');
    
    // Load withdrawals
    const withdrawalsFilePath = path.join(process.cwd(), 'mock', 'withdrawals.json');
    let withdrawals = [];
    
    try {
      if (fs.existsSync(withdrawalsFilePath)) {
        const withdrawalsFileContent = fs.readFileSync(withdrawalsFilePath, 'utf8');
        withdrawals = JSON.parse(withdrawalsFileContent);
      }
    } catch (error) {
      withdrawals = [];
    }
    
    // Filter by NGO if specified
    if (ngoId) {
      withdrawals = withdrawals.filter((w: any) => w.ngoId === parseInt(ngoId));
    }
    
    // Sort by timestamp (newest first)
    withdrawals.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return NextResponse.json({
      success: true,
      withdrawals
    });
    
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}