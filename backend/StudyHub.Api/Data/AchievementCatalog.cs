using StudyHub.Api.Models;

namespace StudyHub.Api.Data;

/// <summary>
/// The single source of truth for the achievement catalog. Used both for EF seeding
/// (fresh databases) and the startup sync (existing databases that predate new badges).
/// </summary>
public static class AchievementCatalog
{
    public static readonly Achievement[] All =
    {
        new() { Code = "first_session", Title = "First Steps", Description = "Complete your first study session.", Icon = "🌱", XpReward = 50 },
        // ---- Streaks ----
        new() { Code = "streak_3", Title = "On a Roll", Description = "Reach a 3-day study streak.", Icon = "🔥", XpReward = 100 },
        new() { Code = "streak_7", Title = "Week Warrior", Description = "Reach a 7-day study streak.", Icon = "⚡", XpReward = 250 },
        new() { Code = "streak_14", Title = "Fortnight Focus", Description = "Reach a 14-day study streak.", Icon = "🌟", XpReward = 400 },
        new() { Code = "streak_30", Title = "Unstoppable", Description = "Reach a 30-day study streak.", Icon = "🏔️", XpReward = 800 },
        // ---- Focus time ----
        new() { Code = "deep_work_10h", Title = "Deep Worker", Description = "Log 10 hours of focused study.", Icon = "🧠", XpReward = 300 },
        new() { Code = "deep_work_25h", Title = "Marathoner", Description = "Log 25 hours of focused study.", Icon = "🏃", XpReward = 600 },
        new() { Code = "deep_work_50h", Title = "Scholar", Description = "Log 50 hours of focused study.", Icon = "🎓", XpReward = 1000 },
        // ---- Sessions ----
        new() { Code = "sessions_25", Title = "Consistent", Description = "Complete 25 study sessions.", Icon = "📅", XpReward = 200 },
        new() { Code = "sessions_100", Title = "Centurion", Description = "Complete 100 study sessions.", Icon = "💯", XpReward = 700 },
        // ---- Flashcards ----
        new() { Code = "cards_50", Title = "Memory Master", Description = "Review 50 flashcards.", Icon = "🃏", XpReward = 200 },
        new() { Code = "cards_200", Title = "Memory Vault", Description = "Review 200 flashcards.", Icon = "🗂️", XpReward = 500 },
        new() { Code = "cards_500", Title = "Recall Master", Description = "Review 500 flashcards.", Icon = "🎴", XpReward = 1000 },
        // ---- Tasks ----
        new() { Code = "task_master", Title = "Task Slayer", Description = "Complete 25 tasks.", Icon = "✅", XpReward = 200 },
        new() { Code = "tasks_50", Title = "Productive", Description = "Complete 50 tasks.", Icon = "📋", XpReward = 400 },
        new() { Code = "tasks_100", Title = "Getting Things Done", Description = "Complete 100 tasks.", Icon = "🏅", XpReward = 800 },
        // ---- Library ----
        new() { Code = "first_deck", Title = "Collector", Description = "Create your first flashcard deck.", Icon = "🗃️", XpReward = 50 },
        new() { Code = "note_taker", Title = "Note Taker", Description = "Write 5 notes.", Icon = "📓", XpReward = 100 },
        // ---- Time of day ----
        new() { Code = "night_owl", Title = "Night Owl", Description = "Study after midnight.", Icon = "🦉", XpReward = 75 },
        new() { Code = "early_bird", Title = "Early Bird", Description = "Study before 7 AM.", Icon = "🐦", XpReward = 75 },
    };
}
