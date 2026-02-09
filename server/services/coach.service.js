const db = require('../config/database');
const logger = require('../utils/logger');

class CoachService {
  async recordCheckIn(userId, activityType = 'study_session', durationMinutes = 0) {
    try {
      logger.info(`Recording check-in for user ${userId}: ${activityType}`);

      // Record study session
      const { data: session, error: sessionError } = await db
        .from('study_sessions')
        .insert({
          user_id: userId,
          activity_type: activityType,
          duration_minutes: durationMinutes,
          session_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (sessionError) {
        logger.error('Error recording study session:', sessionError);
        throw sessionError;
      }

      // Update streak
      const streakData = await this.updateStreak(userId);

      // Get motivation message based on streak
      const motivation = this.getMotivationMessage(streakData.current_streak, activityType);

      return {
        session_id: session.id,
        activity_type: activityType,
        current_streak: streakData.current_streak,
        longest_streak: streakData.longest_streak,
        total_study_days: streakData.total_study_days,
        motivation_message: motivation,
        checked_in_at: session.created_at
      };
    } catch (error) {
      logger.error('Error in recordCheckIn:', error);
      throw error;
    }
  }

  async updateStreak(userId) {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get existing streak data
      const { data: existingStreak, error: fetchError } = await db
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      let newStreakData;

      if (!existingStreak) {
        // Create new streak record
        newStreakData = {
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          total_study_days: 1
        };

        const { data, error } = await db
          .from('user_streaks')
          .insert(newStreakData)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Check if already checked in today
      if (existingStreak.last_activity_date === today) {
        return existingStreak; // No streak update needed
      }

      // Calculate day difference
      const lastDate = new Date(existingStreak.last_activity_date);
      const currentDate = new Date(today);
      const dayDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      let newStreak;
      if (dayDiff === 1) {
        newStreak = existingStreak.current_streak + 1;
      } else if (dayDiff > 1) {
        newStreak = 1;
      } else {
        newStreak = existingStreak.current_streak;
      }

      const longestStreak = Math.max(newStreak, existingStreak.longest_streak);

      // Update streak record
      const { data: updated, error: updateError } = await db
        .from('user_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
          total_study_days: existingStreak.total_study_days + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) throw updateError;

      return updated;
    } catch (error) {
      logger.error('Error updating streak:', error);
      throw error;
    }
  }

  async getUserStats(userId) {
    try {
      logger.info(`Fetching stats for user ${userId}`);

      // Get streak data
      const { data: streak, error: streakError } = await db
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (streakError && streakError.code !== 'PGRST116') {
        throw streakError;
      }

      // Get this week's activities
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: weekSessions, error: sessionsError } = await db
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('session_date', weekAgo.toISOString().split('T')[0])
        .order('session_date', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Count milestones this week
      const milestonesThisWeek = weekSessions?.filter(
        s => s.activity_type === 'milestone_completed'
      ).length || 0;

      // Calculate total study time this week
      const totalMinutesThisWeek = weekSessions?.reduce(
        (sum, s) => sum + (s.duration_minutes || 0), 0
      ) || 0;

      // Get motivation message
      const motivation = this.getMotivationMessage(
        streak?.current_streak || 0,
        'general'
      );

      return {
        current_streak: streak?.current_streak || 0,
        longest_streak: streak?.longest_streak || 0,
        total_study_days: streak?.total_study_days || 0,
        last_activity_date: streak?.last_activity_date || null,
        milestones_this_week: milestonesThisWeek,
        study_minutes_this_week: totalMinutesThisWeek,
        activities_this_week: weekSessions?.length || 0,
        motivation_message: motivation
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  async getRecentSessions(userId, limit = 10) {
    try {
      const { data, error } = await db
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data || [];
    } catch (error) {
      logger.error('Error getting recent sessions:', error);
      throw error;
    }
  }

  getMotivationMessage(streak, activityType) {
    const streakMessages = {
      1: " Great start! Keep the momentum going!",
      3: " 3-day streak! You're on fire!",
      7: " Amazing! 7 days in a row! Keep it up!",
      14: " Two weeks strong! You're crushing it!",
      30: " 30-day streak! You're a champion!",
      50: " 50 days! Unstoppable dedication!",
      100: " 100-day legend! You're an inspiration!"
    };

    // Activity-based messages
    const activityMessages = {
      milestone_completed: [
        " Milestone complete! You're making real progress!",
        " Another milestone down! Keep building your skills!",
        " Milestone achieved! Your dedication is paying off!"
      ],
      study_session: [
        " Study session logged! Consistency is key!",
        " Great work studying today! Knowledge is power!",
        " Another productive session! You're investing in yourself!"
      ],
      roadmap_created: [
        " Roadmap created! Your journey begins now!",
        " Path set! Exciting learning ahead!",
        " Roadmap ready! Time to level up!"
      ],
      skill_assessed: [
        " Skills assessed! Now let's grow them!",
        " Self-awareness is the first step to mastery!",
        " Assessment done! Ready to level up!"
      ],
      lesson_completed: [
        " Lesson complete! Every step counts!",
        " Another lesson mastered! Keep going!",
        " Lesson done! You're building expertise!"
      ],
      general: [
        "Keep up the great work! ",
        "You're doing amazing! ",
        "Every day is progress! "
      ]
    };

    // Check for streak milestones
    if (streakMessages[streak]) {
      return streakMessages[streak];
    }

    // Return activity-specific message
    const messages = activityMessages[activityType] || activityMessages.general;
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Get weekly study calendar (7 days of activity status)
   * @param {string} userId - User ID
   * @returns {array} Array of {date, has_activity} for last 7 days
   */
  async getWeeklyCalendar(userId) {
    try {
      const today = new Date();
      const dates = [];

      // Generate last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }

      // Get sessions for these dates
      const { data: sessions, error } = await db
        .from('study_sessions')
        .select('session_date')
        .eq('user_id', userId)
        .in('session_date', dates);

      if (error) throw error;

      const activeDates = new Set(sessions?.map(s => s.session_date) || []);

      return dates.map(date => ({
        date,
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        has_activity: activeDates.has(date)
      }));
    } catch (error) {
      logger.error('Error getting weekly calendar:', error);
      throw error;
    }
  }

  getStudyTechnique(activityType = 'general', availableMinutes = 60) {
    const techniques = {
      pomodoro: {
        name: "Pomodoro Technique",
        description: "25 minutes of focused work, 5-minute break, repeat 4 times, then take a longer 15-30 minute break",
        bestFor: ["milestone_completed", "study_session", "lesson_completed"],
        duration: "25 min work + 5 min break",
        sessions: Math.floor(availableMinutes / 30),
        steps: [
          "Set timer for 25 minutes",
          "Work with full focus (no distractions)",
          "Take 5-minute break when timer rings",
          "After 4 pomodoros, take 15-30 minute break"
        ],
        benefits: ["Maintains focus", "Prevents burnout", "Tracks productivity"],
        minMinutes: 30
      },
      
      spacedRepetition: {
        name: "Spaced Repetition",
        description: "Review material at increasing intervals (1 day, 3 days, 7 days, 14 days, 30 days)",
        bestFor: ["skill_assessed", "lesson_completed"],
        duration: "15-20 min per session",
        sessions: 5,
        steps: [
          "Learn new material today",
          "Review after 1 day",
          "Review after 3 days",
          "Review after 7 days",
          "Review after 14 days"
        ],
        benefits: ["Better retention", "Long-term memory", "Efficient learning"],
        minMinutes: 15
      },
      
      activeRecall: {
        name: "Active Recall",
        description: "Test yourself without looking at notes, then verify answers",
        bestFor: ["skill_assessed", "milestone_completed"],
        duration: "20-30 minutes",
        sessions: Math.floor(availableMinutes / 25),
        steps: [
          "Close all learning materials",
          "Write down everything you remember",
          "Try to explain concepts in your own words",
          "Check materials and fill gaps",
          "Repeat with problem areas"
        ],
        benefits: ["Strengthens memory", "Identifies weak areas", "Tests understanding"],
        minMinutes: 20
      },
      
      feynman: {
        name: "Feynman Technique",
        description: "Explain concepts in simple terms as if teaching someone else",
        bestFor: ["lesson_completed", "milestone_completed"],
        duration: "30-45 minutes",
        sessions: 1,
        steps: [
          "Choose a concept to learn",
          "Explain it in simple language",
          "Identify gaps in your explanation",
          "Review source material for gaps",
          "Simplify and use analogies"
        ],
        benefits: ["Deep understanding", "Identifies confusion", "Clear thinking"],
        minMinutes: 30
      },
      
      timeBlocking: {
        name: "Time Blocking",
        description: "Schedule specific blocks of time for different tasks",
        bestFor: ["study_session", "roadmap_created"],
        duration: "Full day planning",
        sessions: 1,
        steps: [
          "List all tasks for the day",
          "Assign specific time blocks (9-10am: JavaScript)",
          "Include buffer time between blocks",
          "Stick to the schedule",
          "Review at end of day"
        ],
        benefits: ["Structure", "Prevents procrastination", "Realistic planning"],
        minMinutes: 60
      },
      
      interleaving: {
        name: "Interleaving",
        description: "Mix different subjects or skills in one session instead of blocking",
        bestFor: ["study_session", "skill_assessed"],
        duration: "60-90 minutes",
        sessions: 1,
        steps: [
          "Identify 3-4 related topics",
          "Study topic A for 15-20 minutes",
          "Switch to topic B for 15-20 minutes",
          "Continue rotating through topics",
          "Review all topics at end"
        ],
        benefits: ["Better connections", "Improved problem-solving", "Prevents boredom"],
        minMinutes: 60
      }
    };

    // Determine best technique based on activity and time
    let recommendedTechnique;

    if (availableMinutes >= 60) {
      // Longer sessions: Time Blocking or Interleaving
      recommendedTechnique = activityType === 'roadmap_created' 
        ? techniques.timeBlocking 
        : techniques.interleaving;
    } else if (availableMinutes >= 30) {
      // Medium sessions: Pomodoro or Feynman
      recommendedTechnique = activityType === 'lesson_completed'
        ? techniques.feynman
        : techniques.pomodoro;
    } else if (availableMinutes >= 20) {
      // Short sessions: Active Recall or Spaced Repetition
      recommendedTechnique = techniques.activeRecall;
    } else {
      // Very short: Spaced Repetition review
      recommendedTechnique = techniques.spacedRepetition;
    }

    return {
      recommended: recommendedTechnique,
      alternatives: Object.values(techniques)
        .filter(t => t.name !== recommendedTechnique.name && t.minMinutes <= availableMinutes)
        .map(t => ({
          name: t.name,
          icon: t.icon,
          description: t.description,
          duration: t.duration
        }))
    };
  }

  /**
   * Start a Pomodoro session
   * @param {string} userId - User ID
   * @param {string} taskDescription - What user is working on
   * @returns {object} Pomodoro session data
   */
  async startPomodoroSession(userId, taskDescription = 'Study Session') {
    try {
      const pomodoroData = {
        user_id: userId,
        task: taskDescription,
        duration_minutes: 25,
        started_at: new Date().toISOString(),
        expected_end: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
        session_type: 'work',
        pomodoro_number: 1
      };

      return {
        ...pomodoroData,
        message: "Pomodoro started! Focus for 25 minutes.",
        tips: [
          "Silence notifications",
          "Close unnecessary tabs",
          "Keep water nearby",
          "Single-task only"
        ]
      };
    } catch (error) {
      logger.error('Error starting Pomodoro:', error);
      throw error;
    }
  }

  /**
   * Get study tips based on time of day and user stats
   * @param {object} userStats - User's study statistics
   * @returns {object} Personalized study tips
   */
  getStudyTips(userStats) {
    const hour = new Date().getHours();
    const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    
    const tipsByTime = {
      morning: [
        "Morning is great for tackling difficult concepts when your mind is fresh",
        "Study your hardest subjects first while energy is high",
        "Review yesterday's material before starting new content"
      ],
      afternoon: [
        "Perfect time for hands-on practice and coding exercises",
        "Take active breaks - walk around to maintain focus",
        "Use interleaving to keep your mind engaged"
      ],
      evening: [
        "Great for reviewing and consolidating what you learned today",
        "Light reading and concept review work well now",
        "Prepare tomorrow's study plan before bed"
      ]
    };

    const streakTips = userStats.current_streak > 7
      ? ["You're on a roll! Keep the momentum but don't forget rest days"]
      : userStats.current_streak === 0
      ? ["Start with just 15 minutes - building habits is about consistency"]
      : ["Each day counts! You're building a strong foundation"];

    return {
      time_of_day: timeOfDay,
      time_tips: tipsByTime[timeOfDay],
      streak_tip: streakTips[0],
      general_tips: [
        "Use airplane mode during focused study",
        "Set clear goals before each session",
        "Stay hydrated for better focus",
        "Take breaks to prevent mental fatigue"
      ]
    };
  }
}

module.exports = new CoachService();