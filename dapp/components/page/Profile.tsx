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
        <div className="backdrop-premium border-b border-border px-5 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-copper-gradient rounded-2xl flex items-center justify-center shadow-copper">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-copper">My Profile</h1>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="p-3 hover:bg-secondary rounded-2xl min-h-[44px] min-w-[44px]"
            >
              <Settings className="h-6 w-6 text-muted-foreground" />
            </Button>
          </div>
        </div>

        <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 77px)' }}>
          {/* Wallet Connection Check */}
          {!auth.isConnected ? (
            <Card variant="glass" className="rounded-3xl">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-copper-gradient rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-copper">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-copper mb-2">Connect Your Wallet</h3>
                <p className="text-muted-foreground mb-6">Connect your wallet to view your profile and track your activity</p>
                <WalletConnector onConnect={auth.connectWallet}/>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Wallet Info Card */}
                <Card variant="glass" className="metallic-shine">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-copper-gradient rounded-2xl flex items-center justify-center shadow-copper">
                        <div className="w-8 h-8 bg-white/30 rounded-xl"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-copper mb-1">My Wallet</h3>
                        <div className="flex items-center space-x-3">
                          <span className="text-muted-foreground font-mono" style={{
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            display: 'inline-block',
                            maxWidth: '200px'
                          }}>{auth.userWallet}</span>
                          <Button
                            variant="ghost"
                          size="sm"
                          onClick={copyAddress}
                          className="p-2 hover:bg-secondary rounded-xl"
                        >
                          <Copy className="h-4 w-4 text-copper" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-3">
                <Card variant="premium" className="hover-lift">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-copper-gradient rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-copper">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-copper text-glow-copper">{userBounties}</div>
                    <div className="text-xs text-muted-foreground font-medium">Posted</div>
                  </CardContent>
                </Card>

                <Card variant="premium" className="hover-lift">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-copper-gradient rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-copper">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-copper text-glow-copper">{userAnswers}</div>
                    <div className="text-xs text-muted-foreground font-medium">Answered</div>
                  </CardContent>
                </Card>

                <Card variant="premium" className="hover-lift">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-copper-gradient rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-copper">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-copper text-glow-copper">{rewardsEarned.toFixed(3)}</div>
                    <div className="text-xs text-muted-foreground font-medium">ETH Earned</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card variant="glass">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-copper flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-copper" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activities.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 glass-card rounded-2xl hover-lift">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-copper-gradient shadow-copper">
                        {activity.type === ActivityType.BOUNTY ? (
                          <FileText className="h-4 w-4 text-white" />
                        ) : activity.type === ActivityType.ANSWER ? (
                          <MessageSquare className="h-4 w-4 text-white" />
                        ) : (
                          <Award className="h-4 w-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm line-clamp-1">{activity.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge
                            variant={activity.status === 'open' ? 'copper' : 'glass'}
                            className="text-xs px-2 py-0.5"
                          >
                            <>{console.log(activity)}</>
                            {activity.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
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
                  variant="premium"
                  onClick={() => router.push('/myBounties')}
                  className="w-full rounded-2xl py-4 text-lg font-semibold min-h-[56px]"
                >
                  <FileText className="h-6 w-6 mr-3" />
                  View My Bounties
                </Button>

                <Button
                  variant="glass"
                  onClick={() => router.push('/myBounties')}
                  className="w-full rounded-2xl py-4 text-lg font-semibold min-h-[56px]"
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
