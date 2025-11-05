'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, Clock, User, CheckCircle, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alertDialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useBountyById } from '@/hooks/api/bounties';
import { useCreateAnswer } from '@/hooks/api/answers';
import { useSelectWinner } from '@/hooks/api/winners';

export function ProblemDetail() {
  const router = useRouter();
  const auth = useAuth();
  const [answerContent, setAnswerContent] = useState('');
  const [id, setId] = useState<string | undefined | null>(undefined);
  
  // Fetch bounty details
  const { data: apiBounty, isLoading: bountyLoading, error: bountyError } = useBountyById(id ? parseInt(id) : null);
  
  // Mutations
  const createAnswerMutation = useCreateAnswer();
  const selectWinnerMutation = useSelectWinner();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const value = query.get('id');
    setId(value);
  }, []);

  if (!id || bountyLoading) {
    return (
      <div className="fixed flex flex-col items-center justify-center text-gray-500">
        <p className="mt-4 text-sm m-auto">Loading...</p>
      </div>
    );
  }

  if (bountyError) {
    return (
      <div className="min-h-screen from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading bounty</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!apiBounty) {
    return (
      <div className="min-h-screen from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Bounty not found</p>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Transform API data
  const bounty = {
    ...apiBounty,
    timeLeft: apiBounty.expiresAt ? 
      new Date(apiBounty.expiresAt).toLocaleDateString() : 'No deadline',
    reward: parseFloat(apiBounty.rewardEth),
    postedBy: apiBounty.creator.walletAddress.toLowerCase(),
    description: apiBounty.content,
    answers: apiBounty.answers?.map(answer => ({
      ...answer,
      responderWallet: answer.author.walletAddress.toLowerCase(),
      timestamp: new Date(answer.createdAt),
      isWinner: false // Would need proper logic
    })) || []
  };

  const isOwner = auth.userWallet?.toUpperCase() === bounty.postedBy.toUpperCase();
  const hasUserAnswered = bounty.answers?.some(a => a.responderWallet.toUpperCase() === auth.userWallet?.toUpperCase());
  const isCompleted = bounty.status === 'completed';

  const handleSubmitAnswer = async () => {
    if (!answerContent.trim() || !auth.isAuthenticated || !auth.userWallet) return;
    
    try {
      await createAnswerMutation.mutateAsync({
        content: answerContent,
        bountyId: parseInt(id)
      });
      setAnswerContent('');
      toast.success('Answer submitted successfully!');
    } catch (error) {
      console.error(error)
      toast.error('Failed to submit answer. Please try again.');
    }
  };

  const handleSelectWinner = async (answerId: number) => {
    if (!auth.userWallet) return;
    
    try {
      await selectWinnerMutation.mutateAsync({
        bountyId: parseInt(id),
        answerId: answerId
      });
      toast.success('Reward sent 🎉');
      setTimeout(() => router.push('/home'), 2000);
    } catch (error) {
      console.error(error)
      toast.error('Failed to select winner. Please try again.');
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full bg-gradient-to-br">
      {/* Header */}
      <div className="backdrop-premium border-b border-border px-5 py-4 sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/home')}
            className="p-3 hover:bg-secondary rounded-2xl min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-6 w-6 text-copper" />
          </Button>
          <h1 className="font-semibold text-copper truncate text-lg flex-1">{bounty.title}</h1>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 77px)' }}>
        {/* Completion Banner */}
        {isCompleted && (
          <div className="bg-copper-gradient text-white p-5 rounded-2xl flex items-center space-x-4 shadow-copper">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Bounty Completed</h3>
              <p className="opacity-90">The reward has been distributed to the winner.</p>
            </div>
          </div>
        )}

        {/* Problem Info Card */}
        <Card variant="glass" className="rounded-3xl">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl text-copper leading-7 flex-1 mr-4">{bounty.title}</CardTitle>
              <Badge 
                variant={bounty.status === 'open' ? 'copper' : 'glass'}
                className="px-3 py-1 text-sm rounded-full"
              >
                {bounty.status === 'open' ? 'Open' : 'Completed'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-muted-foreground leading-relaxed">{bounty.description}</p>
            
            <div className="glass-card rounded-3xl p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-copper" />
                    <span className="text-sm text-copper font-medium">Posted by</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {bounty.postedBy.slice(0, 6)}...{bounty.postedBy.slice(-4)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-copper" />
                    <span className="text-sm text-copper font-medium">Time left</span>
                  </div>
                  <span className="font-semibold text-foreground">{bounty.timeLeft}</span>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-border">
                <div className="flex items-center justify-center space-x-3 bg-copper-gradient rounded-2xl p-4 shadow-copper">
                  <Award className="h-5 w-5 text-white" />
                  <span className="font-bold text-white text-xl">{bounty.reward} ETH Reward</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escrow Info */}
        {!isCompleted && (
          <Card variant="premium" className="neon-border">
            <CardContent className="p-5">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-copper-gradient rounded-2xl flex items-center justify-center shadow-copper">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-copper text-lg mb-2">Escrow Protected</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {bounty.reward} ETH is securely locked until winner selection. Funds are automatically released to the selected winner.
                  </p>
                  <div className="mt-3 text-sm text-copper font-medium">
                    {bounty.timeLeft} remaining
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Answer Section */}
        {!isCompleted && auth.isAuthenticated && !hasUserAnswered && !isOwner && (
          <Card variant="glass">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-copper">Submit Answer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Textarea
                variant="premium"
                placeholder="Share your detailed answer here. Be specific and provide examples when possible..."
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                className="min-h-[140px] rounded-2xl p-4 text-base"
              />
              <Button
                variant="premium"
                onClick={handleSubmitAnswer}
                disabled={!answerContent.trim() || createAnswerMutation.isPending}
                className="w-full rounded-2xl py-4 text-lg font-semibold min-h-[56px] disabled:opacity-50"
              >
                {createAnswerMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Answer'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Connect Wallet Prompt */}
        {!isCompleted && !auth.isAuthenticated && (
          <Card variant="glass" className="border-copper/30">
            <CardContent className="p-4 text-center">
              <p className="text-muted-foreground mb-3">Connect your wallet to submit an answer</p>
              <Button
                variant="glass"
                className="border-copper/50 text-copper hover:bg-copper/10"
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Answers Section */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg text-copper flex items-center justify-between">
              Answers ({bounty.answers?.length || 0})
              {(!bounty.answers || bounty.answers.length === 0) && (
                <Badge variant="glass">
                  No answers yet
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bounty.answers?.map((answer: any) => (
              <div
                key={answer.id}
                className={`p-4 rounded-lg border hover-lift ${
                  answer.isWinner
                    ? 'bg-copper-gradient/10 border-copper shadow-copper'
                    : 'glass-card'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {answer.responderWallet.slice(0, 6)}...{answer.responderWallet.slice(-4)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(answer.timestamp)}
                    </span>
                    {answer.isWinner && (
                      <Badge variant="copper">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Winner
                      </Badge>
                    )}
                  </div>
                  <>{console.log("[TEST]", auth.userWallet, bounty.postedBy, !isCompleted, !answer.isWinner)}</>
                  {isOwner && !isCompleted && !answer.isWinner && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="premium"
                          size="sm"
                          className="rounded-lg px-3 py-1"
                        >
                          Select Winner
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="glass-card">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-copper">Select Winner</AlertDialogTitle>
                          <AlertDialogDescription className="text-muted-foreground">
                            This will mark this answer as the winner and send the {bounty.reward} ETH reward to{' '}
                            {answer.responderWallet.slice(0, 6)}...{answer.responderWallet.slice(-4)}.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleSelectWinner(answer.id)}
                            className="bg-copper-gradient hover:bg-copper-gradient"
                          >
                            Confirm & Send Reward
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                
                <p className="text-foreground">{answer.content}</p>
              </div>
            ))}
            
            {(!bounty.answers || bounty.answers.length === 0) && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-copper-gradient rounded-full flex items-center justify-center mx-auto mb-3 shadow-copper">
                  <User className="h-6 w-6 text-white" />
                </div>
                <p className="text-muted-foreground">No answers yet. Be the first to help!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
