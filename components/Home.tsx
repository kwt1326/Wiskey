'use client';

import React, { useState } from 'react';
import { Wallet, Plus, Clock, Award, TrendingUp, DollarSign, MessageSquare, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { BottomNavigation } from './BottomNavigation';
import type { Bounty, Screen } from '@/components/types';

interface HomeProps {
  bounties: Bounty[];
  isWalletConnected: boolean;
  userWallet: string | null;
  onNavigate: (screen: Screen, bountyId?: string) => void;
  onShowConnectModal: () => void;
}

type CurationType = 'newest' | 'popular' | 'high-reward' | 'few-answers';

export function Home({ bounties, isWalletConnected, userWallet, onNavigate, onShowConnectModal }: HomeProps) {
  const [activeTab, setActiveTab] = useState<CurationType>('newest');
  const [isLoading, setIsLoading] = useState(false);

  const activeBounties = bounties.filter(b => b.status === 'open');

  const getSortedBounties = (type: CurationType) => {
    switch (type) {
      case 'newest':
        return [...activeBounties].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'popular':
        return [...activeBounties].sort((a, b) => b.answers.length - a.answers.length);
      case 'high-reward':
        return [...activeBounties].sort((a, b) => b.reward - a.reward);
      case 'few-answers':
        return [...activeBounties].sort((a, b) => a.answers.length - b.answers.length);
      default:
        return activeBounties;
    }
  };

  const handleTabChange = async (tab: CurationType) => {
    if (tab === activeTab) return;
    
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate loading
    setActiveTab(tab);
    setIsLoading(false);
  };

  const tabs = [
    { id: 'newest', label: 'Newest', icon: Sparkles },
    { id: 'popular', label: 'Popular', icon: TrendingUp },
    { id: 'high-reward', label: 'High Reward', icon: DollarSign },
    { id: 'few-answers', label: 'Few Answers', icon: MessageSquare },
  ] as const;

  const displayedBounties = getSortedBounties(activeTab);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-emerald-200/50 px-5 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">S3</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Solve3</h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={isWalletConnected ? undefined : onShowConnectModal}
            className="flex items-center space-x-2 px-4 py-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 transition-all min-h-[44px]"
          >
            <Wallet className="h-5 w-5 text-emerald-600" />
            {isWalletConnected ? (
              <span className="font-medium text-emerald-700">
                {userWallet?.slice(0, 4)}...{userWallet?.slice(-4)}
              </span>
            ) : (
              <span className="font-medium text-emerald-700">Connect</span>
            )}
          </Button>
        </div>
      </div>

      {/* Horizontal Tabs */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-200/30 px-5 py-3">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/70'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
                {isActive && isLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-slate-900">
            {tabs.find(t => t.id === activeTab)?.label} Bounties
          </h2>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1 rounded-full">
            {displayedBounties.length} Open
          </Badge>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-emerald-600">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">Loading bounties...</span>
            </div>
          </div>
        )}

        {/* Bounty List */}
        {!isLoading && (
          <div className="space-y-4 pb-4 overflow-y-auto">
            {displayedBounties.map((bounty) => (
            <Card
              key={bounty.id}
              className="bg-white/95 backdrop-blur-sm border border-emerald-200/50 shadow-sm hover:shadow-lg hover:border-emerald-300/70 transition-all cursor-pointer active:scale-[0.98] rounded-3xl"
              onClick={() => onNavigate('problem-detail', bounty.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Award className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 line-clamp-2 text-lg leading-6 mr-3">
                        {bounty.title}
                      </h3>
                      <Badge 
                        variant={bounty.status === 'open' ? 'default' : 'secondary'}
                        className={bounty.status === 'open' 
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 text-sm rounded-full' 
                          : 'bg-slate-100 text-slate-600 px-3 py-1 text-sm rounded-full'
                        }
                      >
                        {bounty.status === 'open' ? 'Open' : 'Completed'}
                      </Badge>
                    </div>
                    <p className="text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {bounty.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-amber-50 px-3 py-2 rounded-2xl">
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                        <Award className="h-3 w-3 text-amber-600" />
                      </div>
                      <span className="font-bold text-amber-800">{bounty.reward} ETH</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-slate-500">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">{bounty.timeLeft}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full font-medium">
                    {bounty.answers.length} answer{bounty.answers.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}

        {!isLoading && displayedBounties.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Award className="h-12 w-12 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-3">
              {activeTab === 'newest' ? 'No Bounties Yet' : `No ${tabs.find(t => t.id === activeTab)?.label} Bounties`}
            </h3>
            <p className="text-slate-600 mb-8 px-8 leading-relaxed">
              {activeTab === 'newest' 
                ? 'Be the first to post a bounty and get answers from the community!' 
                : 'Try switching to a different tab or post your own bounty.'
              }
            </p>
            <Button
              onClick={() => onNavigate('post-problem')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold min-h-[56px] shadow-lg"
            >
              <Plus className="h-5 w-5 mr-3" />
              Post First Bounty
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {displayedBounties.length > 0 && (
        <Button
          onClick={() => onNavigate('post-problem')}
          className="absolute bottom-28 right-5 w-16 h-16 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all z-30 active:scale-95"
          size="sm"
        >
          <Plus className="h-7 w-7" />
        </Button>
      )}

      {/* Bottom Section with Base Branding */}
      <div className="bg-white/95 backdrop-blur-sm border-t border-emerald-200/50">
        <div className="flex items-center justify-center py-3">
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded"></div>
            <span>Powered by Base</span>
          </div>
        </div>
        <BottomNavigation currentScreen="home" onNavigate={onNavigate} />
      </div>
    </div>
  );
}
