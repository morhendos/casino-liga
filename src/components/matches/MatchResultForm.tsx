"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, AlertCircle, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Team {
  id: string;
  name: string;
}

interface MatchResultFormProps {
  matchId: string;
  teamA: Team;
  teamB: Team;
  matchFormat: 'bestOf3' | 'bestOf5' | 'singleSet';
  existingResult?: {
    teamAScore: number[];
    teamBScore: number[];
    winner: string;
  };
  onResultSaved: () => void;
  onCancel: () => void;
}

const MAX_SET_SCORE = 15; // Maximum allowed score per set

export default function MatchResultForm({
  matchId,
  teamA,
  teamB,
  matchFormat,
  existingResult,
  onResultSaved,
  onCancel
}: MatchResultFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Determine number of sets based on match format
  const getNumberOfSets = () => {
    switch (matchFormat) {
      case 'singleSet':
        return 1;
      case 'bestOf3':
        return 3;
      case 'bestOf5':
        return 5;
      default:
        return 3; // Default to best of 3
    }
  };
  
  // Initialize scores with default values
  const [scores, setScores] = useState<{
    teamA: number[];
    teamB: number[];
  }>({
    teamA: existingResult?.teamAScore || Array(getNumberOfSets()).fill(0),
    teamB: existingResult?.teamBScore || Array(getNumberOfSets()).fill(0)
  });
  
  const [visibleSets, setVisibleSets] = useState(
    existingResult ? Math.max(existingResult.teamAScore.length, 1) : 1
  );
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  
  // Calculate the winner based on current scores
  const calculateWinner = () => {
    let teamAWins = 0;
    let teamBWins = 0;
    
    for (let i = 0; i < visibleSets; i++) {
      if (scores.teamA[i] > scores.teamB[i]) {
        teamAWins++;
      } else if (scores.teamB[i] > scores.teamA[i]) {
        teamBWins++;
      }
    }
    
    const setsToWin = matchFormat === 'bestOf5' ? 3 : (matchFormat === 'bestOf3' ? 2 : 1);
    
    if (teamAWins >= setsToWin) {
      return teamA.id;
    } else if (teamBWins >= setsToWin) {
      return teamB.id;
    }
    
    return null; // No winner yet
  };
  
  // Check if the match is complete (has a winner)
  const isMatchComplete = () => {
    return calculateWinner() !== null;
  };
  
  // Update a score
  const handleScoreChange = (team: 'teamA' | 'teamB', setIndex: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    const validValue = isNaN(numValue) ? 0 : Math.min(Math.max(numValue, 0), MAX_SET_SCORE);
    
    setScores(prev => {
      const newScores = { ...prev };
      newScores[team] = [...prev[team]];
      newScores[team][setIndex] = validValue;
      return newScores;
    });
    
    // Clear validation errors for this field
    if (validationErrors[`${team}-${setIndex}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${team}-${setIndex}`];
        return newErrors;
      });
    }
    
    // If adding to the last visible set, show the next set if available
    if (setIndex === visibleSets - 1 && visibleSets < getNumberOfSets()) {
      setVisibleSets(prev => prev + 1);
    }
  };
  
  // Validate the form
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    let hasWinner = false;
    let teamAWins = 0;
    let teamBWins = 0;
    
    // Check each visible set has valid scores
    for (let i = 0; i < visibleSets; i++) {
      // Check if scores make sense (not both 0 unless it's an unused set)
      if (scores.teamA[i] === 0 && scores.teamB[i] === 0 && i < visibleSets - 1) {
        errors[`teamA-${i}`] = 'Set cannot have both scores as 0';
        errors[`teamB-${i}`] = 'Set cannot have both scores as 0';
      }
      
      // Check if scores are too close (padel usually has at least 2 point difference)
      if (scores.teamA[i] > 0 && scores.teamB[i] > 0) {
        const diff = Math.abs(scores.teamA[i] - scores.teamB[i]);
        if (diff < 2) {
          errors[`teamA-${i}`] = 'Scores must have at least 2 point difference';
          errors[`teamB-${i}`] = 'Scores must have at least 2 point difference';
        }
      }
      
      // Determine winner of this set
      if (scores.teamA[i] > scores.teamB[i]) {
        teamAWins++;
      } else if (scores.teamB[i] > scores.teamA[i]) {
        teamBWins++;
      }
    }
    
    // Check if there's a clear winner
    const setsToWin = matchFormat === 'bestOf5' ? 3 : (matchFormat === 'bestOf3' ? 2 : 1);
    hasWinner = teamAWins >= setsToWin || teamBWins >= setsToWin;
    
    if (!hasWinner) {
      errors['general'] = 'There must be a clear winner for the match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }
    
    // Show confirmation dialog before submitting
    setShowConfirmation(true);
  };
  
  // Submit the result to the API
  const submitResult = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const winner = calculateWinner();
      
      // Trim any unused sets (if the match ended early)
      let lastUsedSetIndex = 0;
      for (let i = 0; i < scores.teamA.length; i++) {
        if (scores.teamA[i] > 0 || scores.teamB[i] > 0) {
          lastUsedSetIndex = i;
        }
      }
      
      const teamAScoreFinal = scores.teamA.slice(0, lastUsedSetIndex + 1);
      const teamBScoreFinal = scores.teamB.slice(0, lastUsedSetIndex + 1);
      
      const response = await fetch(`/api/matches/${matchId}/result`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          result: {
            teamAScore: teamAScoreFinal,
            teamBScore: teamBScoreFinal,
            winner
          },
          status: 'completed'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save match result');
      }
      
      toast.success('Match result saved successfully');
      onResultSaved();
    } catch (error) {
      console.error('Error saving match result:', error);
      setError(error instanceof Error ? error.message : 'Failed to save match result');
      toast.error('Failed to save match result');
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };
  
  // Calculate current match status message
  const getMatchStatusMessage = () => {
    const winner = calculateWinner();
    if (winner) {
      return `Winner: ${winner === teamA.id ? teamA.name : teamB.name}`;
    }
    
    // Count sets won
    let teamAWins = 0;
    let teamBWins = 0;
    
    for (let i = 0; i < visibleSets; i++) {
      if (scores.teamA[i] > scores.teamB[i]) {
        teamAWins++;
      } else if (scores.teamB[i] > scores.teamA[i]) {
        teamBWins++;
      }
    }
    
    if (teamAWins === 0 && teamBWins === 0) {
      return "Enter the scores for each set";
    }
    
    return `Current score: ${teamA.name} ${teamAWins} - ${teamBWins} ${teamB.name}`;
  };
  
  // String representations of scores for inputs to avoid uncontrolled/controlled switching
  const getScoreStringValue = (team: 'teamA' | 'teamB', index: number): string => {
    const score = scores[team][index];
    return score === 0 && index >= visibleSets ? '' : score.toString();
  };
  
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Record Match Result</CardTitle>
        <CardDescription>
          Enter the scores for each set of the match
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>{error}</div>
          </div>
        )}
        
        {validationErrors['general'] && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>{validationErrors['general']}</div>
          </div>
        )}
        
        <div className="space-y-6">
          {/* Match details summary */}
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="font-medium text-lg">{teamA.name}</div>
            <div className="text-muted-foreground">vs</div>
            <div className="font-medium text-lg">{teamB.name}</div>
          </div>
          
          {/* Set scores */}
          <div className="space-y-4">
            {Array.from({ length: visibleSets }).map((_, index) => (
              <div key={`set-${index}`} className="grid grid-cols-11 gap-2 items-center">
                <div className="col-span-1 text-center text-sm font-medium">
                  Set {index + 1}
                </div>
                
                <div className="col-span-4">
                  <Input
                    type="number"
                    min="0"
                    max={MAX_SET_SCORE}
                    value={getScoreStringValue('teamA', index)}
                    onChange={(e) => handleScoreChange('teamA', index, e.target.value)}
                    className={validationErrors[`teamA-${index}`] ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  {validationErrors[`teamA-${index}`] && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors[`teamA-${index}`]}</p>
                  )}
                </div>
                
                <div className="col-span-1 text-center">
                  -
                </div>
                
                <div className="col-span-4">
                  <Input
                    type="number"
                    min="0"
                    max={MAX_SET_SCORE}
                    value={getScoreStringValue('teamB', index)}
                    onChange={(e) => handleScoreChange('teamB', index, e.target.value)}
                    className={validationErrors[`teamB-${index}`] ? "border-red-500" : ""}
                    disabled={isSubmitting}
                  />
                  {validationErrors[`teamB-${index}`] && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors[`teamB-${index}`]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Match winner display */}
          <div className="mt-8 p-4 bg-muted rounded-md">
            <div className="flex items-center justify-center">
              {isMatchComplete() ? (
                <>
                  <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
                  <span className="font-medium text-lg">
                    {calculateWinner() === teamA.id ? teamA.name : teamB.name} wins!
                  </span>
                </>
              ) : (
                <span className="text-muted-foreground">{getMatchStatusMessage()}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !isMatchComplete()}
          className="ml-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Result
            </>
          )}
        </Button>
      </CardFooter>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Match Result</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to record the following result:
              <div className="mt-2 p-3 bg-muted rounded-md">
                <div className="grid grid-cols-3 gap-2 text-center font-medium">
                  <div>{teamA.name}</div>
                  <div>Score</div>
                  <div>{teamB.name}</div>
                </div>
                {scores.teamA.map((score, index) => {
                  // Only show sets that have scores
                  if (index >= visibleSets || (score === 0 && scores.teamB[index] === 0)) {
                    return null;
                  }
                  return (
                    <div key={`confirm-set-${index}`} className="grid grid-cols-3 gap-2 text-center">
                      <div>{score}</div>
                      <div className="text-muted-foreground">Set {index + 1}</div>
                      <div>{scores.teamB[index]}</div>
                    </div>
                  );
                })}
                <div className="mt-2 pt-2 border-t">
                  <div className="text-center font-medium">
                    Winner: {calculateWinner() === teamA.id ? teamA.name : teamB.name}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                This will mark the match as completed and update rankings. Are you sure?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                submitResult();
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Confirm Result"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}