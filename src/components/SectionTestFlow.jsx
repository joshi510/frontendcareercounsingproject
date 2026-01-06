import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { testAPI } from '../services/api';

function SectionTestFlow({ attemptId, initialSection, onSectionComplete, onComplete }) {
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState(initialSection || null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState({ totalTime: 420, isPaused: false, currentTime: 420 });
  const [timerInterval, setTimerInterval] = useState(null);
  const [sectionCompleted, setSectionCompleted] = useState(false);
  const [timeUp, setTimeUp] = useState(false); // Track when timer expires
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(0);
  const optionRefs = useRef([]);
  const submitSectionRef = useRef(null);
  const isSubmittingRef = useRef(false); // Prevent multiple simultaneous submissions

  // Declare currentQuestion early so it's available throughout the component
  const currentQuestion = questions[currentQuestionIndex];

  // Debug logging for question loading
  useEffect(() => {
    if (questions.length > 0) {
      console.log('Questions array length:', questions.length);
      console.log('Current question index:', currentQuestionIndex);
      console.log('Current question:', currentQuestion);
      console.log('Questions:', questions);
    } else {
      console.log('No questions loaded yet');
    }
  }, [questions, currentQuestionIndex, currentQuestion]);

  // ============================================================================
  // ACTION FUNCTIONS - Must be declared before any useEffect or handlers
  // ============================================================================

  const submitSection = async (autoSubmit = false) => {
    // Prevent multiple simultaneous submissions
    if (isSubmittingRef.current) {
      console.log('⚠️ Submission already in progress, skipping...');
      return;
    }

    // If not auto-submit, require all questions to be answered
    if (!autoSubmit && Object.keys(answers).length !== questions.length) {
      setError('Please answer all questions in this section');
      return;
    }

    try {
      isSubmittingRef.current = true;
      setLoading(true);
      setError('');
      
      // Ensure we have questions loaded
      if (!questions || questions.length === 0) {
        throw new Error('No questions loaded for this section');
      }
      
      // For auto-submit, fill missing answers with default 'C'
      const answersArray = questions.map(q => ({
        question_id: Number(q.question_id),
        selected_option: String(answers[q.question_id] || 'C')
      }));

      console.log('📤 Submitting section:', {
        sectionId: currentSection.id,
        attemptId: attemptId,
        answersCount: answersArray.length,
        autoSubmit: autoSubmit,
        answers: answersArray
      });

      // Validate answers array
      if (!answersArray || answersArray.length === 0) {
        throw new Error('No answers to submit');
      }

      // Ensure all answers have required fields
      const validAnswers = answersArray.filter(a => a.question_id && a.selected_option);
      if (validAnswers.length !== answersArray.length) {
        console.warn('⚠️ Some answers are missing required fields');
      }

      let submitResponse;
      try {
        submitResponse = await testAPI.submitSection(currentSection.id, attemptId, validAnswers);
        console.log('✅ Section submitted successfully:', currentSection.name, submitResponse);
      } catch (submitErr) {
        // If error is "already submitted", treat as success and sync from backend
        const errorMsg = submitErr.message || '';
        if (errorMsg.includes('already submitted') || errorMsg.includes('already exist')) {
          console.log('ℹ️ Section already submitted, syncing from backend');
          // Continue to sync from backend below
        } else {
          throw submitErr; // Re-throw other errors
        }
      }
      
      setSectionCompleted(true);
      
      // ALWAYS sync from backend after submission - backend is source of truth
      const progress = await testAPI.getTestProgress(attemptId);
      console.log('🔄 Synced progress from backend:', progress);
      
      if (!progress || progress.status === 'COMPLETED') {
        // Test completed
        if (onComplete) {
          onComplete(attemptId);
        }
        return;
      }
      
      // Get next section from backend progress
      if (progress.current_section) {
        // Load sections to get full section data
        const updatedSectionsData = await testAPI.getSections(attemptId);
        const updatedSections = Array.isArray(updatedSectionsData) ? updatedSectionsData : (updatedSectionsData.sections || []);
        setSections(updatedSections.sort((a, b) => a.order_index - b.order_index));
        
        const nextSection = updatedSections.find(s => s.id === progress.current_section.id);
        
        if (nextSection) {
          console.log('🔄 Transitioning to next section from backend:', nextSection.name);
          
          // Start the next section
          try {
            await testAPI.startSection(attemptId, nextSection.id);
            console.log('✅ Successfully started next section:', nextSection.name);
          } catch (startErr) {
            // If already started, that's fine - continue
            if (!startErr.message?.includes('already') && !startErr.message?.includes('completed')) {
              console.error('❌ Failed to start next section:', startErr);
              setError(`Failed to start next section: ${startErr.message}`);
              return;
            }
          }
          
          // Restore state from backend progress
          setCurrentSection(nextSection);
          setCurrentQuestionIndex(progress.current_question_index || 0);
          setAnswers(progress.answers || {});
          setError('');
          setSectionCompleted(false);
          setTimeUp(false);
          
          // Initialize timer from backend remaining_time_seconds
          setTimer({
            totalTime: progress.remaining_time_seconds || 420,
            isPaused: progress.is_paused || false,
            currentTime: progress.remaining_time_seconds || 420
          });
          
          if (onSectionComplete) {
            onSectionComplete();
          }
        } else {
          // All sections completed (Section 5 done), complete test and automatically show results
          try {
            const result = await testAPI.completeTest(attemptId);
            console.log('✅ Test completed successfully, redirecting to results...', result);
            // Clear localStorage
            // Use test_id from response if available, otherwise use attemptId
            const testId = result?.test_id || result?.test_attempt_id || attemptId;
            if (onComplete) {
              // Automatically navigate to results - no extra button click required
              setTimeout(() => {
                onComplete(testId);
              }, 1500);
            }
          } catch (completeError) {
            console.error('Error completing test:', completeError);
            // Even if completeTest fails, try to navigate to results page
            // The result page will handle loading the interpretation
            setError(`Test submission completed, but finalization had issues: ${completeError.message}. Redirecting to results...`);
            if (onComplete) {
              setTimeout(() => {
                onComplete();
              }, 2000);
            }
          }
        }
      } else {
        // No current section - test completed
        try {
          const result = await testAPI.completeTest(attemptId);
          const testId = result?.test_id || result?.test_attempt_id || attemptId;
          if (onComplete) {
            setTimeout(() => {
              onComplete(testId);
            }, 1500);
          }
        } catch (completeError) {
          console.error('Error completing test:', completeError);
          if (onComplete) {
            setTimeout(() => {
              onComplete(attemptId);
            }, 2000);
          }
        }
      }
    } catch (err) {
      console.error('❌ Error submitting section:', err);
      const errorMessage = err.message || 'Failed to submit section';
      
      // ALWAYS sync from backend on error - backend is source of truth
      console.log('❌ Error submitting section, syncing from backend:', errorMessage);
      try {
        const progress = await testAPI.getTestProgress(attemptId);
        if (progress && progress.current_section) {
          // Load sections to get full section data
          const updatedSectionsData = await testAPI.getSections(attemptId);
          const updatedSections = Array.isArray(updatedSectionsData) ? updatedSectionsData : (updatedSectionsData.sections || []);
          setSections(updatedSections.sort((a, b) => a.order_index - b.order_index));
          
          const nextSection = updatedSections.find(s => s.id === progress.current_section.id);
          if (nextSection) {
            setCurrentSection(nextSection);
            setCurrentQuestionIndex(progress.current_question_index || 0);
            setAnswers(progress.answers || {});
            setTimer({
              totalTime: progress.remaining_time_seconds || 420,
              isPaused: progress.is_paused || false,
              currentTime: progress.remaining_time_seconds || 420
            });
          }
        }
      } catch (syncErr) {
        console.error('Failed to sync from backend:', syncErr);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
      // Reset timeUp state after successful submission
      if (sectionCompleted) {
        setTimeUp(false);
      }
    }
  };

  const handleAnswer = async (questionId, option) => {
    // Prevent answering if time is up
    if (timeUp) return;
    
    const qId = Number(questionId);
    const newAnswers = {
      ...answers,
      [qId]: option
    };
    setAnswers(newAnswers);
    
    // Save answer to backend in real-time (non-blocking)
    if (attemptId && currentSection) {
      testAPI.saveAnswer(attemptId, qId, option).catch(err => {
        console.warn('Failed to save answer in real-time:', err);
        // Don't show error to user - will be saved on submit
      });
    }
  };

  const handleTimeUp = async () => {
    // Prevent multiple calls using ref
    if (timeUp || sectionCompleted || isSubmittingRef.current) {
      return;
    }
    
    console.log('⏰ Time limit reached! Auto-submitting section...');
    isSubmittingRef.current = true;
    setTimeUp(true);
    setError('Time limit reached! Section is being submitted automatically...');
    
    // Clear timer interval to stop further calls
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    try {
      // Auto-submit section with current answers (fill missing with default)
      await submitSection(true); // Pass autoSubmit flag
    } catch (err) {
      console.error('Error in handleTimeUp:', err);
      setError('Failed to auto-submit. Please try again.');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handlePause = async () => {
    if (!currentSection || !attemptId) return;
    try {
      const response = await testAPI.pauseSection(attemptId, currentSection.id);
      // Update timer with remaining_time_seconds from backend
      if (response.remaining_time_seconds !== undefined) {
        setTimer(prev => ({
          ...prev,
          isPaused: true,
          currentTime: response.remaining_time_seconds,
          totalTime: response.remaining_time_seconds
        }));
      } else {
        setTimer(prev => ({ ...prev, isPaused: true }));
      }
    } catch (err) {
      console.error('Failed to pause section:', err);
      setError(err.message || 'Failed to pause');
    }
  };

  const handleResume = async () => {
    if (!currentSection || !attemptId) return;
    try {
      const response = await testAPI.resumeSection(attemptId, currentSection.id);
      // Update timer with remaining_time_seconds from backend
      if (response.remaining_time_seconds !== undefined) {
        setTimer(prev => ({
          ...prev,
          isPaused: false,
          currentTime: response.remaining_time_seconds,
          totalTime: response.remaining_time_seconds
        }));
      } else {
        setTimer(prev => ({ ...prev, isPaused: false }));
        // Sync timer from backend after resume
        updateTimer();
      }
    } catch (err) {
      console.error('Failed to resume section:', err);
      setError(err.message || 'Failed to resume');
    }
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const loadSections = async () => {
    try {
      const data = await testAPI.getSections(attemptId);
      // Handle both response formats: {sections: [...]} or [...]
      const sectionsList = Array.isArray(data) ? data : (data.sections || []);
      setSections(sectionsList.sort((a, b) => a.order_index - b.order_index));
      // Only auto-select if no initialSection provided
      if (!initialSection && !currentSection) {
        const firstSection = sectionsList.find(s => !s.status || s.status === 'NOT_STARTED');
        if (firstSection) {
          setCurrentSection(firstSection);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load sections');
    }
  };

  const loadSectionQuestions = async () => {
    if (!currentSection || !attemptId) return;
    
    try {
      setLoading(true);
      const data = await testAPI.getSectionQuestions(attemptId, currentSection.id);
      setQuestions(data || []);
      
      // Restore answers from backend if section is in progress
      try {
        const progress = await testAPI.getTestProgress(attemptId);
        if (progress && progress.answers) {
          setAnswers(progress.answers);
          setCurrentQuestionIndex(progress.current_question_index || 0);
        } else {
          setCurrentQuestionIndex(0);
          setAnswers({});
        }
      } catch (progressErr) {
        console.error('Failed to restore answers from backend:', progressErr);
        setCurrentQuestionIndex(0);
        setAnswers({});
      }
      
      setTimeUp(false);
    } catch (err) {
      console.error('Error loading questions:', err);
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const startSection = async () => {
    if (!currentSection || !attemptId) return;
    try {
      await testAPI.startSection(attemptId, currentSection.id);
      console.log('✅ Section started:', currentSection.name);
      
      // ALWAYS sync timer from backend - never assume 420 seconds
      const progress = await testAPI.getTestProgress(attemptId);
      if (progress) {
        setTimer({
          totalTime: progress.remaining_time_seconds || 420,
          isPaused: progress.is_paused || false,
          currentTime: progress.remaining_time_seconds || 420
        });
      } else {
        // Fallback only if progress fetch fails
        setTimer({
          totalTime: 420,
          isPaused: false,
          currentTime: 420
        });
      }
    } catch (err) {
      // If section is already started, sync from backend
      if (err.message?.includes('already') || err.message?.includes('completed')) {
        console.log('ℹ️ Section already started, syncing timer from backend');
        try {
          const progress = await testAPI.getTestProgress(attemptId);
          if (progress) {
            setTimer({
              totalTime: progress.remaining_time_seconds || 420,
              isPaused: progress.is_paused || false,
              currentTime: progress.remaining_time_seconds || 420
            });
          }
        } catch (syncErr) {
          console.error('Failed to sync timer:', syncErr);
        }
      } else {
        console.error('❌ Failed to start section:', err);
        setError(err.message || 'Failed to start section');
      }
    }
  };

  const updateTimer = async () => {
    if (!currentSection || !attemptId || timeUp || sectionCompleted || isSubmittingRef.current) {
      return;
    }
    
    try {
      // ALWAYS sync from backend - backend is source of truth
      const progress = await testAPI.getTestProgress(attemptId);
      
      if (progress && progress.current_section && progress.current_section.id === currentSection.id) {
        // Use remaining_time_seconds from backend ONLY
        const remainingTime = progress.remaining_time_seconds || 420;
        
        setTimer({
          totalTime: remainingTime,
          isPaused: progress.is_paused || false,
          currentTime: remainingTime
        });
        
        // Check if time limit reached
        if (remainingTime <= 0 && !timeUp && !sectionCompleted && !isSubmittingRef.current) {
          console.log('⏰ Timer reached zero, triggering auto-submit');
          handleTimeUp();
          return;
        }
        
        // Check if time limit exceeded (auto-completed by backend)
        if (progress.status === 'COMPLETED' && remainingTime <= 0 && !sectionCompleted) {
          // Time limit exceeded, backend already marked as completed
          // Auto-transition to next section
          setSectionCompleted(true);
          setError('Time limit exceeded. Moving to next section...');
          
          // Reload sections and find next section
          setTimeout(async () => {
            try {
              const updatedSectionsData = await testAPI.getSections(attemptId);
              // Handle both response formats: {sections: [...]} or [...]
              const updatedSections = Array.isArray(updatedSectionsData) ? updatedSectionsData : (updatedSectionsData.sections || []);
              setSections(updatedSections.sort((a, b) => a.order_index - b.order_index));
              
              const nextSection = updatedSections.sections.find(s => s.order_index === currentSection.order_index + 1);
              
              if (nextSection) {
                setCurrentSection(nextSection);
                setAnswers({});
                setCurrentQuestionIndex(0);
                setError('');
                setSectionCompleted(false);
                if (onSectionComplete) {
                  onSectionComplete();
                }
              } else {
                // All sections completed (via timer expiry)
                try {
                  const result = await testAPI.completeTest(attemptId, true); // Pass auto_submit=true for timer expiry
                  console.log('✅ Test completed successfully (time limit), redirecting to results...', result);
                  // Use test_id from response if available, otherwise use attemptId
                  const testId = result?.test_id || result?.test_attempt_id || attemptId;
                  if (onComplete) {
                    setTimeout(() => {
                      onComplete(testId);
                    }, 1500);
                  }
                } catch (completeError) {
                  console.error('Error completing test:', completeError);
                  // Even if completeTest fails, try to navigate to results page
                  if (onComplete) {
                    setTimeout(() => {
                      onComplete();
                    }, 2000);
                  }
                }
              }
            } catch (err) {
              console.error('Failed to transition after time limit:', err);
            }
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Timer update error:', err);
    }
  };

  // Parse options string into array format
  // Supports both MCQ (4 options) and Likert scale (5 options)
  // Input: "A) Strongly Disagree, B) Disagree, C) Neutral, D) Agree, E) Strongly Agree"
  // OR: [{key: "A", text: "Strongly Disagree"}, {key: "B", text: "Disagree"}, ...]
  // OR: JSON stringified array
  // Output: [{key: "A", label: "Strongly Disagree"}, {key: "B", label: "Disagree"}, ...]
  const parseOptions = (optionsInput) => {
    if (!optionsInput) return [];
    
    // If already an array, return as-is (with proper formatting)
    if (Array.isArray(optionsInput)) {
      return optionsInput
        .filter(opt => opt && (opt.text || opt.label) && (opt.text || opt.label).trim() !== '')
        .map(opt => ({
          key: String(opt.key || opt.value || 'A').toUpperCase().trim(),
          label: String(opt.label || opt.text || '').trim()
        }))
        .filter(opt => opt.label !== '' && opt.key !== ''); // Remove empty labels/keys
    }
    
    // Try to parse as JSON string first (in case array was stringified)
    if (typeof optionsInput === 'string' && optionsInput.trim()) {
      const trimmed = optionsInput.trim();
      
      // Check if it's a JSON array
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) {
            return parsed
              .filter(opt => opt && (opt.text || opt.label) && (opt.text || opt.label).trim() !== '')
              .map(opt => ({
                key: String(opt.key || opt.value || 'A').toUpperCase().trim(),
                label: String(opt.label || opt.text || '').trim()
              }))
              .filter(opt => opt.label !== '' && opt.key !== '');
          }
        } catch (e) {
          // Not valid JSON, continue with string parsing
        }
      }
      
      // Parse string format: "A) Strongly Disagree, B) Disagree, C) Neutral, D) Agree, E) Strongly Agree"
      const options = [];
      
      // Split by comma, but be smart about it - look for pattern ", A)", ", B)", etc.
      // This handles cases where option text might contain commas
      // Use a more robust regex that matches "A) Text" or "A. Text" patterns
      const parts = trimmed.split(/,\s*(?=[A-E][\)\.])/);
      
      // Parse each part with pattern: ^([A-E])[\)\.]\s*(.+)$
      const optionPattern = /^([A-E])[\)\.]\s*(.+)$/i;
      
      for (const part of parts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue;
        
        const match = trimmedPart.match(optionPattern);
        if (match) {
          const key = match[1].toUpperCase().trim();
          const label = match[2].trim();
          if (key && label) {
            options.push({ key: key, label: label });
          }
        }
      }
      
      // If no options were parsed, try alternative parsing method
      if (options.length === 0) {
        // Try splitting by comma and looking for letter patterns
        const altParts = trimmed.split(',').map(p => p.trim());
        for (const part of altParts) {
          const altMatch = part.match(/^([A-E])[\)\.]\s*(.+)$/i);
          if (altMatch) {
            const key = altMatch[1].toUpperCase().trim();
            const label = altMatch[2].trim();
            if (key && label) {
              options.push({ key: key, label: label });
            }
          }
        }
      }
      
      return options;
    }
    
    return [];
  };

  // Get available options for current question
  // Supports both MCQ (4 options) and Likert scale (5 options)
  const getAvailableOptions = () => {
    if (!currentQuestion) {
      return [];
    }
    
    // Try parsing from options field (string or array)
    if (currentQuestion.options !== undefined && currentQuestion.options !== null) {
      const parsed = parseOptions(currentQuestion.options);
      if (parsed.length > 0) {
        return parsed;
      }
    }
    
    // Fallback: try legacy format option_a, option_b, option_c, option_d
    if (currentQuestion.option_a || currentQuestion.option_b || currentQuestion.option_c || currentQuestion.option_d) {
      return [
        { key: 'A', label: (currentQuestion.option_a || '').trim() },
        { key: 'B', label: (currentQuestion.option_b || '').trim() },
        { key: 'C', label: (currentQuestion.option_c || '').trim() },
        { key: 'D', label: (currentQuestion.option_d || '').trim() }
      ].filter(opt => opt.label !== '');
    }
    
    // No options found
    console.warn('getAvailableOptions - No options found for question:', currentQuestion.question_id);
    return [];
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRemainingTime = () => {
    // timer.currentTime already represents remaining time in seconds
    return Math.max(0, timer.currentTime);
  };

  // ============================================================================
  // KEYBOARD HANDLER - Must be after submitSection declaration
  // ============================================================================

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    // Only handle keyboard events when test is active and question is loaded
    // Disable keyboard navigation when time is up
    if (!currentQuestion || loading || sectionCompleted || timeUp) return;

    const availableOptions = getAvailableOptions();
    if (availableOptions.length === 0) return;

    // Prevent default for arrow keys and Enter/Space to avoid page scrolling
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
    }

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        // Move focus up
        setFocusedOptionIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : availableOptions.length - 1;
          // Focus the button
          setTimeout(() => {
            optionRefs.current[newIndex]?.focus();
          }, 0);
          return newIndex;
        });
        break;

      case 'ArrowDown':
      case 'ArrowRight':
        // Move focus down
        setFocusedOptionIndex(prev => {
          const newIndex = prev < availableOptions.length - 1 ? prev + 1 : 0;
          // Focus the button
          setTimeout(() => {
            optionRefs.current[newIndex]?.focus();
          }, 0);
          return newIndex;
        });
        break;

      case 'Enter':
      case ' ':
        // Select focused option
        const focusedOption = availableOptions[focusedOptionIndex];
        if (focusedOption) {
          const qId = Number(currentQuestion.question_id);
          const optionKey = focusedOption.key || focusedOption.value;
          setAnswers(prevAnswers => {
            const newAnswers = {
              ...prevAnswers,
              [qId]: optionKey
            };
            
            // After selecting with Enter, move to next question if not last
            if (e.key === 'Enter') {
              setTimeout(() => {
                if (currentQuestionIndex < questions.length - 1) {
                  setCurrentQuestionIndex(prevIdx => prevIdx + 1);
                  setFocusedOptionIndex(0);
                } else {
                  // Last question - check if can submit after state updates
                  // Use a small delay to ensure state is updated
                  setTimeout(() => {
                    setAnswers(currentAnswers => {
                      if (Object.keys(currentAnswers).length === questions.length && submitSectionRef.current) {
                        // All questions answered, submit section
                        submitSectionRef.current();
                      }
                      return currentAnswers;
                    });
                  }, 100);
                }
              }, 150);
            }
            
            return newAnswers;
          });
        }
        break;

      default:
        break;
    }
  }, [currentQuestion, loading, sectionCompleted, currentQuestionIndex, questions.length, answers]);

  // ============================================================================
  // useEffect HOOKS
  // ============================================================================


  // Load sections on mount if not already loaded
  useEffect(() => {
    if (attemptId && sections.length === 0) {
      loadSections();
    }
  }, [attemptId]);

  useEffect(() => {
    if (initialSection && !currentSection) {
      setCurrentSection(initialSection);
    }
  }, [initialSection]);

  // Restore state from backend on mount if attemptId exists (for refresh)
  useEffect(() => {
    if (attemptId && !currentSection) {
      const restoreState = async () => {
        try {
          const progress = await testAPI.getTestProgress(attemptId);
          console.log('🔄 Restoring state from backend on mount:', progress);
          
          if (progress && progress.current_section && progress.status !== 'COMPLETED') {
            // Load sections to get full section data
            const sectionsData = await testAPI.getSections(attemptId);
            const allSections = Array.isArray(sectionsData) ? sectionsData : (sectionsData.sections || []);
            setSections(allSections.sort((a, b) => a.order_index - b.order_index));
            
            const restoredSection = allSections.find(s => s.id === progress.current_section.id);
            if (restoredSection) {
              console.log('🔄 Restoring section:', restoredSection.name);
              setCurrentSection(restoredSection);
              setCurrentQuestionIndex(progress.current_question_index || 0);
              setAnswers(progress.answers || {});
              
              // Restore timer from backend - CRITICAL: Use backend value
              const remainingTime = progress.remaining_time_seconds || 420;
              setTimer({
                totalTime: remainingTime,
                isPaused: progress.is_paused || false,
                currentTime: remainingTime
              });
            }
          }
        } catch (err) {
          console.error('Failed to restore state:', err);
        }
      };
      
      restoreState();
    }
  }, [attemptId]);

  useEffect(() => {
    if (currentSection && attemptId) {
      loadSectionQuestions();
      startSection();
    }
  }, [currentSection, attemptId]);

  // Initialize timer from backend when section changes
  useEffect(() => {
    if (currentSection && attemptId) {
      // Always sync timer from backend when section changes
      updateTimer();
    }
  }, [currentSection?.id, attemptId]);

  useEffect(() => {
    // Local countdown timer - decrement every second
    // Start timer if section is active and timer is initialized (> 0)
    if (!timer.isPaused && currentSection && attemptId && timer.currentTime > 0 && !timeUp && !sectionCompleted && !isSubmittingRef.current) {
      // Sync with backend every 10 seconds, but count down locally every second
      let syncCounter = 0;
      const interval = setInterval(() => {
        syncCounter++;
        
        // Decrement timer locally every second
        setTimer(prev => {
          if (prev.currentTime <= 0) {
            // Time's up - trigger auto-submit
            if (!timeUp && !sectionCompleted && !isSubmittingRef.current) {
              console.log('⏰ Timer reached zero, triggering auto-submit');
              handleTimeUp();
            }
            return prev;
          }
          return {
            ...prev,
            currentTime: Math.max(0, prev.currentTime - 1)
          };
        });
        
        // Sync with backend every 10 seconds to ensure accuracy
        if (syncCounter >= 10) {
          syncCounter = 0;
          updateTimer();
        }
      }, 1000);
      
      setTimerInterval(interval);
      
      return () => {
        clearInterval(interval);
        setTimerInterval(null);
      };
    } else {
      // Clear interval if conditions not met
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  }, [timer.isPaused, timer.currentTime, currentSection?.id, attemptId, timeUp, sectionCompleted]);

  // Store submitSection in ref
  useEffect(() => {
    submitSectionRef.current = submitSection;
  }, [submitSection]);

  // Reset focus when question changes
  useEffect(() => {
    if (currentQuestion) {
      setFocusedOptionIndex(0);
      // Auto-focus first option when question loads
      setTimeout(() => {
        optionRefs.current[0]?.focus();
      }, 100);
    }
  }, [currentQuestionIndex, currentQuestion?.question_id]);

  // Add keyboard event listener
  useEffect(() => {
    if (currentQuestion && !loading && !sectionCompleted && !timeUp) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [currentQuestion, loading, sectionCompleted, timeUp, handleKeyDown]);

  if (sectionCompleted) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 dark:bg-green-900/20 rounded-xl p-8 border border-green-200 dark:border-green-800"
        >
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Section Completed!
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Moving to next section...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!currentSection) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Loading sections...</p>
      </div>
    );
  }

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="h-full flex flex-col overflow-hidden max-w-6xl mx-auto w-full">
      {/* Section Header with Timer - Fixed at top */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 mb-3 border border-slate-200 dark:border-slate-700 safe-area-top">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                Step {currentSection.order_index} of {sections.length || 5}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">
              {currentSection.name}
            </h2>
            {currentSection.description && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                {currentSection.description}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className={`text-xl sm:text-2xl font-mono font-bold ${timeUp ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
              {timeUp ? '00:00' : formatTime(getRemainingTime())}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {timeUp ? 'Time Up!' : 'Remaining'}
            </div>
            <div className="flex gap-2 mt-1.5">
              {timeUp ? (
                <div className="px-2.5 py-1 text-xs bg-red-600 text-white rounded-lg">
                  Submitting...
                </div>
              ) : timer.isPaused ? (
                <button
                  onClick={handleResume}
                  className="px-2.5 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Resume
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-2.5 py-1 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Pause
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section Progress */}
        <div className="flex gap-2">
          {sections.map((section, idx) => (
            <div
              key={section.id}
              className={`flex-1 h-1.5 rounded ${
                section.id === currentSection.id
                  ? 'bg-blue-600'
                  : section.status === 'COMPLETED'
                  ? 'bg-green-500'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
              title={section.name}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="flex-shrink-0 mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {/* Main Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">No questions available for this section.</p>
          </div>
        ) : !currentQuestion ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">Question not found. Questions loaded: {questions.length}, Current index: {currentQuestionIndex}</p>
            <p className="text-xs mt-2">Questions: {JSON.stringify(questions.map(q => ({ id: q.question_id, text: q.question_text?.substring(0, 50) })))}</p>
          </div>
        ) : (
          <motion.div
            key={currentQuestion.question_id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 sm:p-5 border border-slate-200 dark:border-slate-700 flex flex-col h-full"
          >
            {/* Question Progress */}
            <div className="mb-4 flex-shrink-0">
              <div className="flex justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-1.5">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex-shrink-0">
              {currentQuestion.question_text}
            </h3>

            {/* Options - Scrollable if needed */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4" role="radiogroup" aria-label="Answer options">
              {(() => {
                const availableOptions = getAvailableOptions();
                if (availableOptions.length > 0) {
                  return availableOptions.map((option, idx) => {
                const optionKey = option.key || option.value;
                const isSelected = answers[currentQuestion.question_id] === optionKey;
                const isFocused = focusedOptionIndex === idx;

                return (
                  <button
                    key={idx}
                    ref={el => optionRefs.current[idx] = el}
                    onClick={() => {
                      if (!timeUp) {
                        handleAnswer(currentQuestion.question_id, option.key || option.value);
                        setFocusedOptionIndex(idx);
                      }
                    }}
                    onFocus={() => !timeUp && setFocusedOptionIndex(idx)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={timeUp ? -1 : (isFocused ? 0 : -1)}
                    disabled={timeUp}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all outline-none ${
                      timeUp
                        ? 'border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : isFocused
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-800'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                    } ${!timeUp ? 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:border-blue-500' : ''}`}
                  >
                    <span className="font-medium text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      {(option.key || option.value || '').toUpperCase()}. {String(option.label || option.text || '').trim()}
                    </span>
                  </button>
                  );
                });
                } else {
                  return (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <p>No options available for this question.</p>
                      <p className="text-xs mt-2">Please check the console for debugging information.</p>
                    </div>
                  );
                }
              })()}
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation Footer - Fixed at bottom */}
      {questions.length > 0 && (
        <div className="flex-shrink-0 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 mt-3 border border-slate-200 dark:border-slate-700 z-10 safe-area-bottom">
          {console.log('Rendering navigation footer. Questions:', questions.length, 'Current index:', currentQuestionIndex)}
          <div className="flex justify-between">
            <button
              onClick={() => {
                if (currentQuestionIndex > 0) {
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                  setFocusedOptionIndex(0);
                  setError('');
                }
              }}
              disabled={currentQuestionIndex === 0 || !currentQuestion}
              className="px-5 py-2 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              Previous
            </button>
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => {
                  if (!currentQuestion) return;
                  // Prevent moving to next question without selecting an option
                  if (!answers[currentQuestion.question_id]) {
                    setError('Please select an answer before moving to the next question');
                    return;
                  }
                  setCurrentQuestionIndex(currentQuestionIndex + 1);
                  setFocusedOptionIndex(0);
                  setError('');
                }}
                disabled={!currentQuestion}
                className="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
              >
                Next
              </button>
            ) : (
              <button
                onClick={submitSection}
                disabled={loading || !currentQuestion || Object.keys(answers).length !== questions.length}
                className="px-5 py-2 text-sm bg-green-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:focus:ring-0"
              >
                {loading ? 'Submitting...' : 'Submit Section'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SectionTestFlow;


