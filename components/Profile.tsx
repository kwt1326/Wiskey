'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MobileBottomSection, MOBILE_BOTTOM_SECTION_PADDING } from './MobileBottomSection';
import {
  Settings,
  Copy,
  FileText,
  MessageSquare,
  Award,
  TrendingUp,
} from 'lucide-react';
import { useAppState } from '@/components/app-state';
import { toast } from 'sonner';
import PageMainWrapper from './PageMainWrapper';

export function Profile() {
  const router = useRouter();
  const {
    isWalletConnected,
    userWallet,
    bounties,
    openConnectModal,
  } = useAppState();
  const copyAddress = () => {
    if (userWallet) {
      navigator.clipboard.writeText(userWallet);
      toast.success('Address copied!');
    }
  };

  const userBounties = bounties.filter(b => b.postedBy === userWallet);
  const userAnswers = bounties.filter(b => 
    b.answers.some(a => a.responderWallet === userWallet)
  );
  const rewardsEarned = bounties
    .flatMap(b => b.answers)
    .filter(a => a.responderWallet === userWallet && a.isWinner)
    .reduce((sum, a) => {
      const bounty = bounties.find(b => b.answers.includes(a));
      return sum + (bounty?.reward || 0);
    }, 0);

  const recentActivity = [
    { type: 'posted', title: 'How to automate NFT minting?', status: 'Open', time: '2h ago' },
    { type: 'answered', title: 'Best DeFi yield farming strategies?', status: 'Pending', time: '5h ago' },
    { type: 'won', title: 'How to integrate Base network?', status: 'Won', time: '1d ago' },
    { type: 'posted', title: 'Smart contract optimization tips?', status: 'Completed', time: '2d ago' },
  ];

  const generateAvatar = (address: string) => {
    const colors = ['bg-emerald-400', 'bg-teal-400', 'bg-green-400', 'bg-cyan-400'];
    const index = address ? parseInt(address.slice(-1), 16) % colors.length : 0;
    return colors[index];
  };

  return (
    <>
      <PageMainWrapper>
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-emerald-200/50 px-5 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900">My Profile</h1>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="p-3 hover:bg-emerald-100 rounded-2xl min-h-[44px] min-w-[44px]"
            >
              <Settings className="h-6 w-6 text-slate-600" />
            </Button>
          </div>
        </div>

        <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 77px)' }}>
          {/* Wallet Connection Check */}
          {!isWalletConnected ? (
            <Card className="bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-2">Connect Your Wallet</h3>
                <p className="text-emerald-700 mb-6">Connect your wallet to view your profile and track your activity</p>
                <Button
                  onClick={openConnectModal}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl px-8 py-3 font-semibold"
                >
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Wallet Info Card */}
              <Card className="bg-white/90 backdrop-blur-sm border border-emerald-200/50 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 ${generateAvatar(userWallet || '')} rounded-2xl flex items-center justify-center`}>
                      <div className="w-8 h-8 bg-white/30 rounded-xl"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">My Wallet</h3>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-600 font-mono">{userWallet}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyAddress}
                          className="p-2 hover:bg-emerald-100 rounded-xl"
                        >
                          <Copy className="h-4 w-4 text-emerald-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-gradient-to-br from-emerald-100 to-emerald-200 border border-emerald-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-800">{userBounties.length}</div>
                    <div className="text-xs text-emerald-700 font-medium">Posted</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-teal-100 to-teal-200 border border-teal-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-teal-800">{userAnswers.length}</div>
                    <div className="text-xs text-teal-700 font-medium">Answered</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-amber-800">{rewardsEarned.toFixed(3)}</div>
                    <div className="text-xs text-amber-700 font-medium">ETH Earned</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="bg-white/90 backdrop-blur-sm border border-emerald-200/50 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-slate-900 flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-emerald-50/50 rounded-2xl">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activity.type === 'posted' ? 'bg-emerald-100' :
                          activity.type === 'answered' ? 'bg-teal-100' : 'bg-amber-100'
                        }`}>
                        {activity.type === 'posted' ? (
                          <FileText className={`h-4 w-4 ${activity.type === 'posted' ? 'text-emerald-600' : ''
                            }`} />
                        ) : activity.type === 'answered' ? (
                          <MessageSquare className="h-4 w-4 text-teal-600" />
                        ) : (
                          <Award className="h-4 w-4 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 text-sm line-clamp-1">{activity.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant="secondary"
                            className={`text-xs px-2 py-0.5 ${activity.status === 'Open' ? 'bg-emerald-100 text-emerald-700' :
                                activity.status === 'Pending' ? 'bg-teal-100 text-teal-700' :
                                  activity.status === 'Won' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                              }`}
                          >
                            {activity.status}
                          </Badge>
                          <span className="text-xs text-slate-500">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-4 pb-6">
                <Button
                  onClick={() => router.push('/my-bounties')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl py-4 text-lg font-semibold min-h-[56px]"
                >
                  <FileText className="h-6 w-6 mr-3" />
                  View My Bounties
                </Button>

                <Button
                  onClick={() => router.push('/my-bounties')}
                  variant="outline"
                  className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-2xl py-4 text-lg font-semibold min-h-[56px]"
                >
                  <MessageSquare className="h-6 w-6 mr-3" />
                  View My Answers
                </Button>
              </div>
            </>
          )}
        </div>
      </PageMainWrapper>
      <MobileBottomSection brandingText="Powered by Base" />
    </>
  );
}
