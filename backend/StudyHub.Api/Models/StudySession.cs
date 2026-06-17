using System.ComponentModel.DataAnnotations;

namespace StudyHub.Api.Models;

/// <summary>A logged focus session (one completed Pomodoro work block, or a manual log).</summary>
public class StudySession
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public User? User { get; set; }

    [MaxLength(120)]
    public string Subject { get; set; } = "General";

    /// <summary>Focused minutes for this session.</summary>
    public int DurationMinutes { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime EndedAt { get; set; } = DateTime.UtcNow;
}
