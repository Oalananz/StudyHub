using System.ComponentModel.DataAnnotations;

namespace StudyHub.Api.Models;

/// <summary>A catalog badge that can be unlocked.</summary>
public class Achievement
{
    [Key, MaxLength(60)]
    public string Code { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Icon { get; set; } = "🏆";

    public int XpReward { get; set; } = 50;
}

public class UserAchievement
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public User? User { get; set; }

    [MaxLength(60)]
    public string AchievementCode { get; set; } = string.Empty;
    public Achievement? Achievement { get; set; }

    public DateTime UnlockedAt { get; set; } = DateTime.UtcNow;
}
