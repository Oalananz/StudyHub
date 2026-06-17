using Microsoft.EntityFrameworkCore;
using StudyHub.Api.Data;
using StudyHub.Api.Models;

namespace StudyHub.Api.Services;

/// <summary>Handles streaks, XP, and achievement unlocking after study activity.</summary>
public class GamificationService
{
    private readonly AppDbContext _db;
    public GamificationService(AppDbContext db) => _db = db;

    /// <summary>Call after a study session is logged. Updates streak + XP and unlocks badges.</summary>
    public async Task<List<Achievement>> OnStudyActivityAsync(User user, DateTime activityUtc)
    {
        var today = DateOnly.FromDateTime(activityUtc);

        // Streak logic
        if (user.LastStudyDate is null)
        {
            user.CurrentStreak = 1;
        }
        else if (user.LastStudyDate == today)
        {
            // already counted today
        }
        else if (user.LastStudyDate == today.AddDays(-1))
        {
            user.CurrentStreak += 1;
        }
        else
        {
            user.CurrentStreak = 1;
        }

        user.LastStudyDate = today;
        user.LongestStreak = Math.Max(user.LongestStreak, user.CurrentStreak);

        var unlocked = await EvaluateAchievementsAsync(user, activityUtc);
        return unlocked;
    }

    public async Task<List<Achievement>> EvaluateAchievementsAsync(User user, DateTime nowUtc)
    {
        var newlyUnlocked = new List<Achievement>();

        var owned = await _db.UserAchievements
            .Where(ua => ua.UserId == user.Id)
            .Select(ua => ua.AchievementCode)
            .ToListAsync();

        var totalSessions = await _db.Sessions.CountAsync(s => s.UserId == user.Id);
        var totalMinutes = await _db.Sessions.Where(s => s.UserId == user.Id).SumAsync(s => (int?)s.DurationMinutes) ?? 0;
        var completedTasks = await _db.Tasks.CountAsync(t => t.UserId == user.Id && t.Status == Models.TaskStatus.Done);
        var reviewedCards = await _db.Flashcards
            .Where(c => c.Deck!.UserId == user.Id && c.LastReviewedAt != null)
            .CountAsync();
        var totalDecks = await _db.Decks.CountAsync(d => d.UserId == user.Id);
        var totalNotes = await _db.Notes.CountAsync(n => n.UserId == user.Id);

        var localHour = nowUtc.Hour;

        void Try(string code, bool condition)
        {
            if (condition && !owned.Contains(code))
                newlyUnlocked.Add(new Achievement { Code = code });
        }

        Try("first_session", totalSessions >= 1);
        Try("streak_3", user.CurrentStreak >= 3);
        Try("streak_7", user.CurrentStreak >= 7);
        Try("streak_14", user.CurrentStreak >= 14);
        Try("streak_30", user.CurrentStreak >= 30);
        Try("deep_work_10h", totalMinutes >= 600);
        Try("deep_work_25h", totalMinutes >= 1500);
        Try("deep_work_50h", totalMinutes >= 3000);
        Try("sessions_25", totalSessions >= 25);
        Try("sessions_100", totalSessions >= 100);
        Try("cards_50", reviewedCards >= 50);
        Try("cards_200", reviewedCards >= 200);
        Try("cards_500", reviewedCards >= 500);
        Try("task_master", completedTasks >= 25);
        Try("tasks_50", completedTasks >= 50);
        Try("tasks_100", completedTasks >= 100);
        Try("first_deck", totalDecks >= 1);
        Try("note_taker", totalNotes >= 5);
        Try("night_owl", localHour >= 0 && localHour < 4);
        Try("early_bird", localHour >= 4 && localHour < 7);

        if (newlyUnlocked.Count == 0) return newlyUnlocked;

        // Persist unlocks and award XP using full catalog data.
        var codes = newlyUnlocked.Select(a => a.Code).ToList();
        var catalog = await _db.Achievements.Where(a => codes.Contains(a.Code)).ToListAsync();

        foreach (var ach in catalog)
        {
            _db.UserAchievements.Add(new UserAchievement
            {
                UserId = user.Id,
                AchievementCode = ach.Code,
                UnlockedAt = nowUtc
            });
            user.Xp += ach.XpReward;
        }

        return catalog;
    }
}
