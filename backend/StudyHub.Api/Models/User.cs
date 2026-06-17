using System.ComponentModel.DataAnnotations;

namespace StudyHub.Api.Models;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(80)]
    public string DisplayName { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    public int Xp { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public DateOnly? LastStudyDate { get; set; }

    // User preferences (stored as simple columns for the Pomodoro defaults)
    public int PomodoroWorkMinutes { get; set; } = 25;
    public int PomodoroShortBreakMinutes { get; set; } = 5;
    public int PomodoroLongBreakMinutes { get; set; } = 15;
    public int PomodoroRoundsBeforeLongBreak { get; set; } = 4;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<StudySession> Sessions { get; set; } = new List<StudySession>();
    public ICollection<TaskItem> Tasks { get; set; } = new List<TaskItem>();
    public ICollection<Deck> Decks { get; set; } = new List<Deck>();
    public ICollection<Note> Notes { get; set; } = new List<Note>();
    public ICollection<UserAchievement> Achievements { get; set; } = new List<UserAchievement>();
}
