'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Award, Lock, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alertDialog';
import BountyDeposit, { OnDepositSuccessPayload } from '../base/BountyDeposit';
import { useAuth } from '@/hooks/useAuth';
import { useCreateBounty } from '@/hooks/api/bounties';

export function PostProblem() {
  const router = useRouter();
  const auth = useAuth();
  const createBountyMutation = useCreateBounty();

  const isCreatingRef = useRef(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdBountyId, setCreatedBountyId] = useState<number | null>(null);

  const isFormValid = !!(title.trim() && description.trim() && reward && parseFloat(reward) > 0 && auth.isAuthenticated && auth.userWallet)

  const handleCreateBounty = async (payload: OnDepositSuccessPayload) => {
    try {
      if (isCreatingRef.current || createdBountyId) return;
      
      if (!isFormValid) throw new Error("A form invalid")

      isCreatingRef.current = true

      const result = await createBountyMutation.mutateAsync({
        title: title.trim(),
        content: description.trim(),
        rewardEth: payload.rewardEth,
        rewardTxHash: payload.txHash, // Would be actual tx hash
        vaultBountyId: payload.vaultBountyId // Would be actual vault ID
      });
      
      setCreatedBountyId(result.id)
      setShowSuccessModal(true);
      
      setTitle('');
      setDescription('');
      setReward('');
    } catch (error) {
      console.error('Failed to create bounty:', error);
    }
  };

  const handleViewBounty = () => {
    setShowSuccessModal(false);
    if (createdBountyId) {
      router.push(`/problem/${createdBountyId}`);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full">
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
          <h1 className="text-xl font-semibold text-slate-900">Post a New Bounty</h1>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 77px)' }}>
        {/* Wallet Connection Check */}
        {!auth.isAuthenticated && (
          <Card className="bg-yellow-50 border border-yellow-200">
            <CardContent className="p-5">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-900 text-lg">Wallet Required</h4>
                  <p className="text-yellow-800">Connect your wallet to post a bounty</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Form */}
        <Card className="bg-white/95 backdrop-blur-sm border border-emerald-200/50 shadow-sm rounded-3xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-slate-900">Bounty Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-slate-700 text-lg font-medium">Title</Label>
              <Input
                id="title"
                placeholder="What problem do you need help with?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-200 rounded-2xl p-4 text-base min-h-[52px]"
                disabled={!auth.isAuthenticated}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-slate-700 text-lg font-medium">Description</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your problem. Include any relevant context, requirements, or examples."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[140px] bg-white border-slate-200 focus:border-emerald-300 focus:ring-emerald-200 rounded-2xl p-4 text-base"
                disabled={!auth.isAuthenticated}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="reward" className="text-slate-700 text-lg font-medium">Reward (ETH)</Label>
              <Input
                id="reward"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="0.01"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="bg-white border-slate-200 focus:border-emerald-300 focus:ring-emerald-200 rounded-2xl p-4 text-base min-h-[52px]"
                disabled={!auth.isAuthenticated}
              />
            </div>
          </CardContent>
        </Card>

        {/* Escrow Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50">
          <CardContent className="p-5">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 text-lg mb-2">Escrow Protection</h4>
                <p className="text-blue-700 leading-relaxed">
                  Your reward will be locked in escrow until completion. Funds are automatically released to the selected winner. 
                  If no winner is selected within 7 days, you can reclaim your deposit.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="space-y-4 pb-6">
          <BountyDeposit
            rewardEth={reward}
            title={title}
            description={description}
            userWallet={auth.userWallet || null}
            onDepositSuccess={handleCreateBounty}
            isFormValid={isFormValid}
          />

          {/* Fee Info */}
          <div className="text-center text-slate-500">
            <p>Platform fee: 2.5% • Gas fees apply</p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent className="max-w-sm mx-auto">
          <AlertDialogHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <AlertDialogTitle className="text-xl">Bounty Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Your bounty has been posted and is now visible to the community. The reward has been locked in escrow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col space-y-2">
            <Button
              onClick={handleViewBounty}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl"
            >
              View Bounty
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/');
              }}
              className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Back to Home
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
