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
      setTimeout(() => router.push('/'), 2000);
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
      <div className="bg-white/90 backdrop-blur-sm border-b border-emerald-200/50 px-5 py-4 sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="p-3 hover:bg-emerald-100 rounded-2xl min-h-[44px] min-w-[44px]"
          >
            <ArrowLeft className="h-6 w-6 text-emerald-600" />
          </Button>
          <h1 className="font-semibold text-slate-900 truncate text-lg flex-1">{bounty.title}</h1>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 77px)' }}>
        {/* Completion Banner */}
        {isCompleted && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-5 rounded-2xl flex items-center space-x-4">
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
        <Card className="bg-white/95 backdrop-blur-sm border border-emerald-200/50 shadow-sm rounded-3xl">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <CardTitle className="text-xl text-slate-900 leading-7 flex-1 mr-4">{bounty.title}</CardTitle>
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
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-slate-700 leading-relaxed">{bounty.description}</p>
            
            <div className="bg-emerald-50/50 rounded-3xl p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700 font-medium">Posted by</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {bounty.postedBy.slice(0, 6)}...{bounty.postedBy.slice(-4)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-emerald-700 font-medium">Time left</span>
                  </div>
                  <span className="font-semibold text-slate-900">{bounty.timeLeft}</span>
                </div>
              </div>
              
              <div className="mt-5 pt-4 border-t border-emerald-200">
                <div className="flex items-center justify-center space-x-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                    <Award className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className="font-bold text-amber-900 text-xl">{bounty.reward} ETH Reward</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Escrow Info */}
        {!isCompleted && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50">
            <CardContent className="p-5">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 text-lg mb-2">Escrow Protected</h4>
                  <p className="text-blue-700 leading-relaxed">
                    {bounty.reward} ETH is securely locked until winner selection. Funds are automatically released to the selected winner.
                  </p>
                  <div className="mt-3 text-sm text-blue-600 font-medium">
                    {bounty.timeLeft} remaining
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Answer Section */}
        {!isCompleted && auth.isAuthenticated && !hasUserAnswered && !isOwner && (
          <Card className="bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900">Submit Answer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <Textarea
                placeholder="Share your detailed answer here. Be specific and provide examples when possible..."
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                className="min-h-[140px] bg-white border-slate-200 focus:border-emerald-300 focus:ring-emerald-200 rounded-2xl p-4 text-base"
              />
              <Button
                onClick={handleSubmitAnswer}
                disabled={!answerContent.trim() || createAnswerMutation.isPending}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl py-4 text-lg font-semibold min-h-[56px] disabled:opacity-50"
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
          <Card className="bg-yellow-50 border border-yellow-200">
            <CardContent className="p-4 text-center">
              <p className="text-yellow-800 mb-3">Connect your wallet to submit an answer</p>
              <Button
                variant="outline"
                className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Answers Section */}
        <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900 flex items-center justify-between">
              Answers ({bounty.answers?.length || 0})
              {(!bounty.answers || bounty.answers.length === 0) && (
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                  No answers yet
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {bounty.answers?.map((answer: any) => (
              <div
                key={answer.id}
                className={`p-4 rounded-lg border ${
                  answer.isWinner
                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600">
                      {answer.responderWallet.slice(0, 6)}...{answer.responderWallet.slice(-4)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatTimestamp(answer.timestamp)}
                    </span>
                    {answer.isWinner && (
                      <Badge className="bg-emerald-500 text-white">
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
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg px-3 py-1"
                        >
                          Select Winner
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Select Winner</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will mark this answer as the winner and send the {bounty.reward} ETH reward to{' '}
                            {answer.responderWallet.slice(0, 6)}...{answer.responderWallet.slice(-4)}.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleSelectWinner(answer.id)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                          >
                            Confirm & Send Reward
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                
                <p className="text-slate-700">{answer.content}</p>
              </div>
            ))}
            
            {(!bounty.answers || bounty.answers.length === 0) && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-500">No answers yet. Be the first to help!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
