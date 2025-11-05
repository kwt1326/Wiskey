'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Award, Clock, User, CheckCircle, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { MobileBottomSection } from '../MobileBottomSection';
import { useAuth } from '@/hooks/useAuth';
import { useMyBounties, useAnsweredBounties } from '@/hooks/api/bounties';
import { type Bounty as _Bounty, type Answer, AnswerStatus, Bounty } from '@/lib/types/api';
import PageMainWrapper from '../PageMainWrapper';

export function MyBounties() {
  const router = useRouter();
  const auth = useAuth();
  const myBounties = useMyBounties();
  const myAnswers = useAnsweredBounties();
  const [activeTab, setActiveTab] = useState('posted');

  // Use API data with loading states
  const postedBounties = myBounties.data || [];
  const answeredBounties = myAnswers.data || [];
  const _isLoading = myBounties.isLoading || myAnswers.isLoading;
  const _hasError = myBounties.error || myAnswers.error;

  const getUserAnswerStatus = (bounty: any) =>
    bounty.answers?.find((a: Answer) => a.author?.walletAddress.toLowerCase() === auth.userWallet?.toLowerCase())
      ? AnswerStatus.WINNER : AnswerStatus.PENDING;

  const renderBountyCard = (bounty: Bounty, type: 'posted' | 'answered') => {
    const answerStatus = type === 'answered' ? getUserAnswerStatus(bounty) : null;
    
    return (
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
                  variant={bounty.status === 'open' ? 'copper' : 'glass'}
                  className="px-3 py-1 text-sm rounded-full"
                >
                  {bounty.status === 'open' ? 'Open' : 'Completed'}
                </Badge>
                {type === 'answered' && answerStatus && (
                  <Badge
                    variant={answerStatus === 'winner' ? 'copper' : 'glass'}
                    className="text-xs"
                  >
                    {answerStatus === 'winner' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {answerStatus === 'winner' ? 'Winner' :
                      answerStatus === 'pending' ? 'Pending' : 'Not Selected'}
                  </Badge>
                )}
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

      // <Card
      //   key={bounty.id}
      //   variant="glass"
      //   className="w-full hover-lift cursor-pointer"
      //   onClick={() => router.push(`/problem/detail?id=${bounty.id}`)}
      // >
      //   <CardContent className="p-4">
      //     <div className="flex items-start justify-between mb-3">
      //       <h3 className="font-semibold text-copper line-clamp-2 flex-1 mr-3">
      //         {bounty.title}
      //       </h3>
      //       <div className="flex flex-col items-end space-y-1">
      //         <Badge 
      //           variant={bounty.status === 'open' ? 'copper' : 'glass'}
      //         >
      //           {bounty.status === 'open' ? 'Open' : 'Completed'}
      //         </Badge>
              
      //         {type === 'answered' && answerStatus && (
      //           <Badge 
      //             variant={answerStatus === 'winner' ? 'copper' : 'glass'}
      //             className="text-xs"
      //           >
      //             {answerStatus === 'winner' && <CheckCircle className="h-3 w-3 mr-1" />}
      //             {answerStatus === 'winner' ? 'Winner' : 
      //              answerStatus === 'pending' ? 'Pending' : 'Not Selected'}
      //           </Badge>
      //         )}
      //       </div>
      //     </div>
          
      //     <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
      //       {bounty.content}
      //     </p>
          
      //     <div className="flex items-center justify-between">
      //       <div className="flex items-center space-x-4">
      //         <div className="flex items-center space-x-1">
      //           <Award className="h-4 w-4 text-copper" />
      //           <span className="font-semibold text-foreground">{parseFloat(bounty.rewardEth || '0')} ETH</span>
      //         </div>
              
      //         <div className="flex items-center space-x-1 text-muted-foreground">
      //           <Clock className="h-4 w-4" />
      //           <span className="text-sm">{bounty.expiresAt ? new Date(bounty.expiresAt).toLocaleDateString() : 'No deadline'}</span>
      //         </div>
      //       </div>
            
      //       <Badge variant="glass" className="text-xs">
      //         {bounty.answerCount} answer{bounty.answerCount !== 1 ? 's' : ''}
      //       </Badge>
      //     </div>
          
      //     {type === 'posted' && bounty.status === 'open' && bounty.answerCount > 0 && (
      //       <div className="mt-3 pt-3 border-t border-border">
      //         <p className="text-sm text-copper font-medium">
      //           {bounty.answerCount} answer{bounty.answerCount !== 1 ? 's' : ''} waiting for review
      //         </p>
      //       </div>
      //     )}
      //   </CardContent>
      // </Card>
    );
  };

  const renderEmptyState = (type: 'posted' | 'answered') => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-copper-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-copper">
        {type === 'posted' ? (
          <Award className="h-8 w-8 text-white" />
        ) : (
          <User className="h-8 w-8 text-white" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-copper mb-2">
        {type === 'posted' ? 'No bounties posted yet' : 'No bounties answered yet'}
      </h3>
      <p className="text-muted-foreground mb-6">
        {type === 'posted' 
          ? 'Create your first bounty and get answers from the community!'
          : 'Start helping others by answering bounties and earn rewards!'
        }
      </p>
      <Button
        variant="premium"
        onClick={() =>
          router.push(type === 'posted' ? '/postProblem' : '/home')
        }
        className="px-6 py-2 rounded-xl"
      >
        {type === 'posted' ? 'Post First Bounty' : 'Browse Bounties'}
      </Button>
    </div>
  );

  return (
    <>
      <PageMainWrapper>
        {/* Header */}
        <div className="backdrop-premium border-b border-border px-5 py-4 sticky top-0 z-40">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-copper-gradient rounded-xl flex items-center justify-center shadow-copper">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-copper">My Bounties</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-6 overflow-y-auto min-h-0" style={{ height: "calc(100vh - 344px)" }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full w-full flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 glass-card rounded-2xl p-2 h-18">
              <TabsTrigger
                value="posted"
                className="rounded-xl data-[state=active]:bg-[#b8621f] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#a0a0a0] font-medium"
              >
                Posted ({postedBounties.length})
              </TabsTrigger>
              <TabsTrigger
                value="answered"
                className="rounded-xl data-[state=active]:bg-[#b8621f] data-[state=active]:text-white data-[state=active]:shadow-sm text-[#a0a0a0] font-medium"
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
          <div className="border-b border-border px-5 py-4">
            <Card variant="premium">
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-copper text-glow-copper">
                      {postedBounties.reduce((sum, bounty) => sum + parseFloat(bounty.rewardEth || '0'), 0).toFixed(3)}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">ETH Posted</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-copper text-glow-copper">
                      {
                        answeredBounties.filter(
                          (bounty) => getUserAnswerStatus(bounty) === 'winner',
                        ).length
                      }
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">Wins</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-copper text-glow-green">
                      {answeredBounties
                        .filter((bounty) => getUserAnswerStatus(bounty) === 'winner')
                        .reduce((sum, bounty) => sum + parseFloat(bounty.rewardEth || '0'), 0)
                        .toFixed(3)}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground">ETH Earned</div>
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
