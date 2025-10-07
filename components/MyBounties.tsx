'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Clock, User, CheckCircle, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MobileBottomSection } from './MobileBottomSection';
import { useAppState } from '@/components/app-state';
import type { Bounty } from '@/components/types';
import PageMainWrapper from './PageMainWrapper';

export function MyBounties() {
  const router = useRouter();
  const { bounties, userWallet } = useAppState();
  const [activeTab, setActiveTab] = useState('posted');

  // Filter bounties posted by user
  const postedBounties = bounties.filter(b => b.postedBy === userWallet);
  
  // Filter bounties where user has answered
  const answeredBounties = bounties.filter(b => 
    b.answers.some(a => a.responderWallet === userWallet)
  );

  const getUserAnswerStatus = (bounty: Bounty) => {
    const userAnswer = bounty.answers.find(a => a.responderWallet === userWallet);
    if (!userAnswer) return null;
    
    if (userAnswer.isWinner) return 'winner';
    if (bounty.status === 'completed') return 'not-selected';
    return 'pending';
  };

  const renderBountyCard = (bounty: Bounty, type: 'posted' | 'answered') => {
    const answerStatus = type === 'answered' ? getUserAnswerStatus(bounty) : null;
    
    return (
      <Card
        key={bounty.id}
        className="w-full bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-sm hover:shadow-md transition-all cursor-pointer"
        onClick={() => router.push(`/problem/${bounty.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-slate-900 line-clamp-2 flex-1 mr-3">
              {bounty.title}
            </h3>
            <div className="flex flex-col items-end space-y-1">
              <Badge 
                variant={bounty.status === 'open' ? 'default' : 'secondary'}
                className={bounty.status === 'open' 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                  : 'bg-slate-100 text-slate-600'
                }
              >
                {bounty.status === 'open' ? 'Open' : 'Completed'}
              </Badge>
              
              {type === 'answered' && answerStatus && (
                <Badge 
                  variant={answerStatus === 'winner' ? 'default' : 'secondary'}
                  className={
                    answerStatus === 'winner' 
                      ? 'bg-emerald-500 text-white text-xs' 
                      : answerStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-700 text-xs'
                      : 'bg-slate-100 text-slate-600 text-xs'
                  }
                >
                  {answerStatus === 'winner' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {answerStatus === 'winner' ? 'Winner' : 
                   answerStatus === 'pending' ? 'Pending' : 'Not Selected'}
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {bounty.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Award className="h-4 w-4 text-amber-500" />
                <span className="font-semibold text-slate-900">{bounty.reward} ETH</span>
              </div>
              
              <div className="flex items-center space-x-1 text-slate-500">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{bounty.timeLeft}</span>
              </div>
            </div>
            
            <div className="text-xs text-slate-500">
              {bounty.answers.length} answer{bounty.answers.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          {type === 'posted' && bounty.status === 'open' && bounty.answers.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-sm text-emerald-600 font-medium">
                {bounty.answers.length} answer{bounty.answers.length !== 1 ? 's' : ''} waiting for review
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderEmptyState = (type: 'posted' | 'answered') => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        {type === 'posted' ? (
          <Award className="h-8 w-8 text-slate-400" />
        ) : (
          <User className="h-8 w-8 text-slate-400" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {type === 'posted' ? 'No bounties posted yet' : 'No bounties answered yet'}
      </h3>
      <p className="text-slate-600 mb-6">
        {type === 'posted' 
          ? 'Create your first bounty and get answers from the community!'
          : 'Start helping others by answering bounties and earn rewards!'
        }
      </p>
      <Button
        onClick={() =>
          router.push(type === 'posted' ? '/post-problem' : '/')
        }
        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-2 rounded-xl"
      >
        {type === 'posted' ? 'Post First Bounty' : 'Browse Bounties'}
      </Button>
    </div>
  );

  return (
    <>
      <PageMainWrapper>
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-slate-200/50 px-5 py-4 sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">My Bounties</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-6 overflow-y-auto min-h-0" style={{ height: "calc(100vh - 344px)" }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full w-full flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-2 h-18">
              <TabsTrigger
                value="posted"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-base font-medium py-3"
              >
                Posted ({postedBounties.length})
              </TabsTrigger>
              <TabsTrigger
                value="answered"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white text-base font-medium py-3"
              >
                Answered ({answeredBounties.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posted" className="flex-1 mt-6 min-h-0">
              <div className="space-y-4 w-full">
                {postedBounties.length > 0 ? (
                  postedBounties.map(bounty => renderBountyCard(bounty, 'posted'))
                ) : (
                  renderEmptyState('posted')
                )}
              </div>
            </TabsContent>

            <TabsContent value="answered" className="flex-1 mt-6 min-h-0">
              <div className="space-y-4 w-full">
                {answeredBounties.length > 0 ? (
                  answeredBounties.map(bounty => renderBountyCard(bounty, 'answered'))
                ) : (
                  renderEmptyState('answered')
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageMainWrapper>

      <MobileBottomSection className="border-slate-200/50">
        {(postedBounties.length > 0 || answeredBounties.length > 0) && (
          <div className="border-b border-slate-200/50 px-5 py-4">
            <Card className="border border-slate-200/50 bg-gradient-to-r from-slate-50 to-slate-100">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-emerald-600">
                      {postedBounties.reduce((sum, bounty) => sum + bounty.reward, 0).toFixed(3)}
                    </div>
                    <div className="text-sm font-medium text-slate-500">ETH Posted</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-amber-600">
                      {
                        answeredBounties.filter(
                          (bounty) => getUserAnswerStatus(bounty) === 'winner',
                        ).length
                      }
                    </div>
                    <div className="text-sm font-medium text-slate-500">Wins</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-600">
                      {answeredBounties
                        .filter((bounty) => getUserAnswerStatus(bounty) === 'winner')
                        .reduce((sum, bounty) => sum + bounty.reward, 0)
                        .toFixed(3)}
                    </div>
                    <div className="text-sm font-medium text-slate-500">ETH Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </ MobileBottomSection>
    </>
  );
}
