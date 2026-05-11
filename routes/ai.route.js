import express from 'express';
const router = express.Router();
import Diary from '../models/diary.model.js';
import Gratitude from '../models/gratitude.model.js';
import User from '../models/user.model.js';
import { generateWeeklyInsights, generateEmotionCloud, getCopingSuggestions } from '../services/ai.service.js';

// Middleware to verify JWT would usually be here, but using a simple auth check if available
// For now, assuming user ID is passed or available via middleware

router.get('/dashboard-insights', async (req, res) => {
    try {
        const userId = req.query.userId || req.user?.id; // Fallback to query if middleware not yet set up
        
        if (!userId) {
            return res.status(401).json({ error: "User ID required" });
        }

        // Fetch last 30 days of data for trends
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [allDiaryEntries, allGratitudeEntries, allEntriesForStreak, userData] = await Promise.all([
            Diary.find({ user: userId, createdAt: { $gte: thirtyDaysAgo } }).sort({ createdAt: 1 }),
            Gratitude.find({ user: userId, createdAt: { $gte: thirtyDaysAgo } }).sort({ createdAt: 1 }),
            Diary.find({ user: userId }).sort({ createdAt: -1 }).select('createdAt'),
            User.findById(userId)
        ]);

        // Calculate Streak
        let streak = 0;
        if (allEntriesForStreak.length > 0) {
            const dates = allEntriesForStreak.map(e => new Date(e.createdAt).toDateString());
            const uniqueDates = [...new Set(dates)];
            
            let current = new Date();
            
            const lastEntryDate = new Date(uniqueDates[0]);
            const diffDays = Math.floor((current - lastEntryDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 1) {
                for (let i = 0; i < uniqueDates.length; i++) {
                    const entryDate = new Date(uniqueDates[i]);
                    const expectedDate = new Date(current);
                    expectedDate.setDate(current.getDate() - i);
                    
                    if (entryDate.toDateString() !== expectedDate.toDateString()) {
                        if (i === 0 && entryDate.toDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toDateString()) {
                            continue;
                        }
                        break;
                    }
                    streak++;
                }
            }
        }

        // Generate data for trends and recent mood
        const recentDiary = [...allDiaryEntries].reverse().slice(0, 5);
        const recentGratitude = [...allGratitudeEntries].reverse().slice(0, 5);

        // --- AI INSIGHT CACHING LOGIC ---
        let insights;
        const now = new Date();
        const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours
        
        const isCacheValid = userData?.lastInsight?.generatedAt && 
                           (now - new Date(userData.lastInsight.generatedAt) < cacheDuration) &&
                           !userData.needsInsightUpdate;

        if (isCacheValid) {
            insights = {
                pulse: userData.lastInsight.pulse,
                tip: userData.lastInsight.tip
            };
        } else {
            // Generate New Insights
            insights = await generateWeeklyInsights(
                userData?.name || "User", 
                recentDiary, 
                recentGratitude
            );

            // Update Cache
            await User.findByIdAndUpdate(userId, {
                lastInsight: {
                    ...insights,
                    generatedAt: now
                },
                needsInsightUpdate: false
            });
        }
        // -------------------------------

        // Calculate Mood Trends (7, 14, 30 days)
        const calculateTrends = (days) => {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            
            const filtered = allDiaryEntries.filter(e => new Date(e.createdAt) >= cutoff);
            const trends = filtered.map(entry => {
                const emos = entry.emotions || {};
                // Mood Intensity: Average of positive emotions (happy, calm, excited, grateful, hopeful)
                const positive = (emos.happy || 0) + (emos.calm || 0) + (emos.excited || 0) + (emos.grateful || 0) + (emos.hopeful || 0);
                const negative = (emos.sad || 0) + (emos.angry || 0) + (emos.anxious || 0);
                const intensity = Math.max(0, Math.min(10, (positive - negative + 10) / 2)); // Simple 0-10 scale
                
                return {
                    date: new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
                    intensity: Math.round(intensity * 10) / 10
                };
            });
            return trends;
        };

        const trend7d = calculateTrends(7);
        const trend14d = calculateTrends(14);
        const trend30d = calculateTrends(30);

        // Emotion Cloud
        const emotionCloud = generateEmotionCloud(allDiaryEntries);

        // Coping Suggestions
        const copingSuggestions = getCopingSuggestions();

        // Current Mood Balance (based on 7 days)
        const defaultMood = { happy: 0, sad: 0, angry: 0, anxious: 0, calm: 0, excited: 0, grateful: 0, hopeful: 0 };
        const moodStats = recentDiary.reduce((acc, entry) => {
            const emos = entry.emotions || {};
            Object.keys(emos).forEach(emo => {
                if (acc.hasOwnProperty(emo)) {
                    acc[emo] = (acc[emo] || 0) + (entry.emotions[emo] || 0);
                }
            });
            return acc;
        }, { ...defaultMood });

        const totalEntries = recentDiary.length || 1;
        const normalizedMood = Object.fromEntries(
            Object.entries(moodStats).map(([emo, val]) => [emo, Math.round(val / totalEntries)])
        );

        return res.json({
            ...insights,
            moodTrend: normalizedMood,
            trends: {
                "7d": trend7d,
                "14d": trend14d,
                "30d": trend30d
            },
            emotionCloud,
            copingSuggestions,
            entryCount: allDiaryEntries.length,
            streak: streak
        });

    } catch (error) {
        console.error("Dashboard Insights Route Error:", error);
        return res.status(500).json({ error: "Failed to generate insights" });
    }
});

export default router;
