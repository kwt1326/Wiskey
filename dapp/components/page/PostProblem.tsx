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
import BountyDeposit, { OnDepositSuccessPayload } from '../onchain/BountyDeposit';
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
      router.push(`/problem/detail?id=${createdBountyId}`);
    } else {
      router.push('/home');
    }
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 w-full">
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
          <h1 className="text-xl font-semibold text-copper">Post a New Bounty</h1>
        </div>
      </div>

      <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto min-h-0" style={{ maxHeight: 'calc(100vh - 77px)' }}>
        {/* Wallet Connection Check */}
        {!auth.isAuthenticated && (
          <Card variant="glass" className="border-[#E09F47]/30">
            <CardContent className="p-5">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-copper-gradient rounded-2xl flex items-center justify-center shadow-copper">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-copper text-lg">Wallet Required</h4>
                  <p className="text-muted-foreground">Connect your wallet to post a bounty</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Form */}
        <Card variant="glass" className="rounded-3xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-copper">Bounty Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="title" className="text-foreground text-lg font-medium">Title</Label>
              <Input
                id="title"
                variant="premium"
                placeholder="What problem do you need help with?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-2xl p-4 text-base min-h-[52px]"
                disabled={!auth.isAuthenticated}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-foreground text-lg font-medium">Description</Label>
              <Textarea
                id="description"
                variant="premium"
                placeholder="Provide detailed information about your problem. Include any relevant context, requirements, or examples."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[140px] rounded-2xl p-4 text-base"
                disabled={!auth.isAuthenticated}
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="reward" className="text-foreground text-lg font-medium">Reward (ETH)</Label>
              <Input
                id="reward"
                variant="premium"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="0.01"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                className="rounded-2xl p-4 text-base min-h-[52px]"
                disabled={!auth.isAuthenticated}
              />
            </div>
          </CardContent>
        </Card>

        {/* Escrow Info */}
        <Card className="bg-gradient-to-r from-[#b8621f] to-[#a35619] border-0 shadow-sm rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Escrow Protection</h4>
                <p className="text-sm text-white/90 leading-relaxed">
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
          <div className="text-center text-xs text-[#a0a0a0]">
            <p>Platform fee: 10% • Gas fees apply</p>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AlertDialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <AlertDialogContent className="max-w-sm mx-auto glass-card">
          <AlertDialogHeader className="text-center">
            <div className="w-16 h-16 bg-copper-gradient rounded-full flex items-center justify-center mx-auto mb-4 shadow-copper">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <AlertDialogTitle className="text-xl text-copper">Bounty Created Successfully!</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Your bounty has been posted and is now visible to the community. The reward has been locked in escrow.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col space-y-2">
            <Button
              variant="premium"
              onClick={handleViewBounty}
              className="w-full rounded-xl"
            >
              View Bounty
            </Button>
            <Button
              variant="glass"
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/home');
              }}
              className="w-full rounded-xl"
            >
              Back to Home
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
