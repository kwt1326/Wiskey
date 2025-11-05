'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Clock,
  Award,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { MobileBottomSection, MOBILE_BOTTOM_SECTION_PADDING } from '../MobileBottomSection';
import { useAuth } from '@/hooks/useAuth';
import { useBounties } from '@/hooks/api/bounties';
import { BountyStatus } from '@/lib/types/api';
import PageMainWrapper from '../PageMainWrapper';
import WalletConnector from '../onchain/WalletConnector';
import WiskeyLogo from '../WiskeyLogo';

type CurationType = 'newest' | 'popular' | 'high-reward' | 'few-answers';

export function Home() {
  const router = useRouter();
  
  const auth = useAuth();
  const bounties = useBounties();
  const [activeTab, setActiveTab] = useState<CurationType>('newest');

  const getSortedBounties = (type: CurationType) => {
    if (!bounties.data) return [];
    
    const openBounties = bounties.data.filter(b => b.status === BountyStatus.OPEN);
    
    switch (type) {
      case 'newest':
        return [...openBounties].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'popular':
        return [...openBounties].sort((a, b) => (b.answerCount || 0) - (a.answerCount || 0));
      case 'high-reward':
        return [...openBounties].sort((a, b) => parseFloat(b.rewardEth || '0') - parseFloat(a.rewardEth || '0'));
      case 'few-answers':
        return [...openBounties].sort((a, b) => (a.answerCount || 0) - (b.answerCount || 0));
      default:
        return openBounties;
    }
  };

  const handleTabChange = async (tab: CurationType) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };

  const tabs = [
    { id: 'newest', label: 'Newest', icon: Sparkles },
    { id: 'popular', label: 'Popular', icon: TrendingUp },
    { id: 'high-reward', label: 'High Reward', icon: DollarSign },
    { id: 'few-answers', label: 'Few Answers', icon: MessageSquare },
  ] as const;

  const displayedBounties = getSortedBounties(activeTab);

  return (
    <>
      <PageMainWrapper>
        {/* Header */}
        <div className="backdrop-premium border-b border-border px-5 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <WiskeyLogo />
            <WalletConnector onConnect={auth.connectWallet}/>
          </div>
        </div>

        {/* Horizontal Tabs */}
        <div className="backdrop-premium border-b border-border px-5 py-3">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all min-h-[44px] ${isActive
                      ? 'bg-copper-gradient text-white shadow-copper'
                      : 'glass-card text-foreground hover:bg-secondary'
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                  {isActive && bounties.isLoading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div
          className="flex flex-col flex-1 w-screen px-5 py-4 min-h-0"
          style={{ height: 'calc(100vh - 154px - var(--mobile-bottom-section-height, 0px))' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-copper">
              {tabs.find(t => t.id === activeTab)?.label} Bounties
            </h2>
            <Badge variant="glass">
              {displayedBounties?.filter(b => b.status === BountyStatus.OPEN).length || 0} Open
            </Badge>
          </div>

          {/* Loading State */}
          {bounties.isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2 text-copper">
                <div className="w-6 h-6 border-2 border-copper border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium">Loading bounties...</span>
              </div>
            </div>
          )}

          {/* Bounty List */}
          {!bounties.isLoading && (
            <div className="space-y-4 pb-4 overflow-y-auto">
              {displayedBounties?.map((bounty) => (
                <Card
                  key={bounty.id}
                  variant="glass"
                  className="hover-lift cursor-pointer active:scale-[0.98] rounded-3xl"
                  onClick={() => router.push(`/problem/detail?id=${bounty.id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-copper-gradient rounded-2xl flex items-center justify-center flex-shrink-0 shadow-copper">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-foreground line-clamp-2 text-lg leading-6 mr-3">
                            {bounty.title}
                          </h3>
                          <Badge
                            variant={bounty.status === BountyStatus.OPEN ? 'copper' : 'glass'}
                            className="px-3 py-1 text-sm rounded-full"
                          >
                            {bounty.status === BountyStatus.OPEN ? 'Open' : 'Completed'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                          {bounty.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-copper-gradient px-3 py-2 rounded-2xl shadow-copper">
                          <Award className="h-4 w-4 text-white" />
                          <span className="font-bold text-white">{parseFloat(bounty.rewardEth || '0')} ETH</span>
                        </div>

                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">{bounty.remainingTime ?? 'No deadline'}</span>
                        </div>
                      </div>

                      <Badge variant="glass" className="text-sm font-medium">
                        {bounty.answerCount} answer{bounty.answerCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!bounties.isLoading && (!displayedBounties || displayedBounties.length === 0) && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-copper-gradient rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-copper">
                <Award className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-copper mb-3">
                {activeTab === 'newest' ? 'No Bounties Yet' : `No ${tabs.find(t => t.id === activeTab)?.label} Bounties`}
              </h3>
              <p className="text-muted-foreground mb-8 px-8 leading-relaxed">
                {activeTab === 'newest'
                  ? 'Be the first to post a bounty and get answers from the community!'
                  : 'Try switching to a different tab or post your own bounty.'
                }
              </p>
              <Button
                variant="premium"
                onClick={() => router.push('/postProblem')}
                className="px-8 py-4 rounded-2xl text-lg font-semibold min-h-[56px]"
              >
                <Plus className="h-5 w-5 mr-3" />
                Post First Bounty
              </Button>
            </div>
          )}
        </div>
      </PageMainWrapper>
      {/* Floating Action Button */}
      {(displayedBounties?.length ?? 0) > 0 && (
        <Button
          variant="premium"
          onClick={() => router.push('/postProblem')}
          className="absolute right-5 w-16 h-16 rounded-3xl z-30 active:scale-95"
          style={{
            bottom: `calc(${MOBILE_BOTTOM_SECTION_PADDING} - 25px)`,
          }}
          size="sm"
        >
          <Plus className="h-7 w-7" />
        </Button>
      )}

      {/* Bottom Section with Base Branding */}
      <MobileBottomSection />
    </>
  );
}
