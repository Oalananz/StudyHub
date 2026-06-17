using System.ComponentModel.DataAnnotations;
using StudyHub.Api.Models;

namespace StudyHub.Api.DTOs;

// ----- Auth -----
public record RegisterDto([Required] string DisplayName, [Required, EmailAddress] string Email, [Required, MinLength(6)] string Password);
public record LoginDto([Required, EmailAddress] string Email, [Required] string Password);
public record AuthResponse(string Token, UserDto User);

public record UserDto(Guid Id, string DisplayName, string Email, int Xp, int CurrentStreak, int LongestStreak,
    int PomodoroWorkMinutes, int PomodoroShortBreakMinutes, int PomodoroLongBreakMinutes, int PomodoroRoundsBeforeLongBreak)
{
    public static UserDto From(User u) => new(u.Id, u.DisplayName, u.Email, u.Xp, u.CurrentStreak, u.LongestStreak,
        u.PomodoroWorkMinutes, u.PomodoroShortBreakMinutes, u.PomodoroLongBreakMinutes, u.PomodoroRoundsBeforeLongBreak);
}

public record UpdatePrefsDto(int PomodoroWorkMinutes, int PomodoroShortBreakMinutes, int PomodoroLongBreakMinutes, int PomodoroRoundsBeforeLongBreak);

// ----- Sessions -----
public record CreateSessionDto([Required] string Subject, [Range(1, 600)] int DurationMinutes, string? Notes, DateTime? StartedAt, DateTime? EndedAt);
public record SessionDto(Guid Id, string Subject, int DurationMinutes, string? Notes, DateTime StartedAt, DateTime EndedAt);

// ----- Tasks -----
public record CreateTaskDto([Required] string Title, string? Description, string? Subject, DateOnly? DueDate);
public record UpdateTaskDto(string? Title, string? Description, string? Subject, DateOnly? DueDate, Models.TaskStatus? Status, int? Position);
public record TaskDto(Guid Id, string Title, string? Description, string? Subject, DateOnly? DueDate, Models.TaskStatus Status, int Position);

// ----- Decks / Flashcards -----
public record CreateDeckDto([Required] string Name, string? Description, string? Color);
public record DeckDto(Guid Id, string Name, string? Description, string Color, int CardCount, int DueCount);
public record CreateCardDto([Required] string Front, [Required] string Back);
public record CardDto(Guid Id, string Front, string Back, DateTime DueAt, int Repetitions, double EaseFactor, int IntervalDays);
/// <summary>SM-2 review grade: 0=again, 3=hard, 4=good, 5=easy.</summary>
public record ReviewCardDto([Range(0, 5)] int Quality);

// ----- Notes -----
public record CreateNoteDto(string? Title, Guid? ParentId, string? Icon);
public record UpdateNoteDto(string? Title, string? Content, string? Icon, Guid? ParentId);
public record NoteDto(Guid Id, Guid? ParentId, string Title, string Content, string Icon, DateTime UpdatedAt);

// ----- Achievements / dashboard -----
public record AchievementDto(string Code, string Title, string Description, string Icon, int XpReward, bool Unlocked, DateTime? UnlockedAt);
public record SubjectTimeDto(string Subject, int Minutes);
public record HeatmapDayDto(DateOnly Date, int Minutes);
public record DashboardDto(
    UserDto User,
    int TotalMinutes,
    int TodayMinutes,
    int SessionsCount,
    int DueCards,
    int OpenTasks,
    List<SubjectTimeDto> TimeBySubject,
    List<HeatmapDayDto> Heatmap);
