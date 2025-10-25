'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { MobileBottomSection } from '../MobileBottomSection';
import {
  Settings,
  Copy,
  FileText,
  MessageSquare,
  Award,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMyPageStats, useRecentActivities } from '@/hooks';
import { toast } from 'sonner';
import PageMainWrapper from '../PageMainWrapper';
import WalletConnector from '../onchain/WalletConnector';
import { ActivityType } from '@/lib/types/api';

export function Profile() {
  const router = useRouter();
  const auth = useAuth();
  const { data: stats } = useMyPageStats();
  const { data: activities = [] } = useRecentActivities();

  const copyAddress = () => {
    if (auth.userWallet) {
      navigator.clipboard.writeText(auth.userWallet);
      toast.success('Address copied!');
    }
  };

  // Use stats data from the API instead of filtering bounties
  const userBounties = stats?.bountyCount || 0;
  const userAnswers = stats?.answerCount || 0;
  const rewardsEarned = parseFloat(stats?.totalRewardEth || '0');

  const generateAvatar = (address: string) => {
    const colors = ['bg-emerald-400', 'bg-teal-400', 'bg-green-400', 'bg-cyan-400'];
    const index = address ? parseInt(address.slice(-1), 16) % colors.length : 0;
    return colors[index];
  };


  const timeAgoIntl = (
    date: Date,
    locale = 'en',
  ): string => {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    const nowUtcMs = Date.now();
    const targetUtcMs = date.getTime();
    const diffMs = nowUtcMs - targetUtcMs;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // 가장 큰 단위 우선
    if (Math.abs(days) > 0) return rtf.format(days, 'day');
    if (Math.abs(hours) > 0) return rtf.format(hours, 'hour');
    if (Math.abs(minutes) > 0) return rtf.format(minutes, 'minute');
    return rtf.format(seconds, 'second');
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
          {!auth.isConnected ? (
            <Card className="bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-emerald-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-2">Connect Your Wallet</h3>
                <p className="text-emerald-700 mb-6">Connect your wallet to view your profile and track your activity</p>
                <WalletConnector onConnect={auth.connectWallet}/>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Wallet Info Card */}
                <Card className="bg-white/90 backdrop-blur-sm border border-emerald-200/50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 ${generateAvatar(auth.userWallet || '')} rounded-2xl flex items-center justify-center`}>
                        <div className="w-8 h-8 bg-white/30 rounded-xl"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">My Wallet</h3>
                        <div className="flex items-center space-x-3">
                          <span className="text-slate-600 font-mono" style={{
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            display: 'inline-block',
                            maxWidth: '200px'
                          }}>{auth.userWallet}</span>
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
                    <div className="text-2xl font-bold text-emerald-800">{userBounties}</div>
                    <div className="text-xs text-emerald-700 font-medium">Posted</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-teal-100 to-teal-200 border border-teal-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-teal-800">{userAnswers}</div>
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
                  {activities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-emerald-50/50 rounded-2xl">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activity.type === ActivityType.BOUNTY ? 'bg-emerald-100' :
                          activity.type === ActivityType.ANSWER ? 'bg-teal-100' : 'bg-amber-100'
                        }`}>
                        {activity.type === ActivityType.BOUNTY ? (
                          <FileText className={`h-4 w-4 ${activity.type === ActivityType.BOUNTY ? 'text-emerald-600' : ''
                            }`} />
                        ) : activity.type === ActivityType.ANSWER ? (
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
                            className={`text-xs px-2 py-0.5 ${activity.status === 'open' ? 'bg-emerald-100 text-emerald-700' :
                                activity.status === 'pending' ? 'bg-teal-100 text-teal-700' :
                                  activity.status === 'winner' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                              }`}
                          >
                            <>{console.log(activity)}</>
                            {activity.status}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {timeAgoIntl(new Date(activity.createdAt))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-4 pb-6">
                <Button
                  onClick={() => router.push('/myBounties')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl py-4 text-lg font-semibold min-h-[56px]"
                >
                  <FileText className="h-6 w-6 mr-3" />
                  View My Bounties
                </Button>

                <Button
                  onClick={() => router.push('/myBounties')}
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
