using System.ComponentModel.DataAnnotations;

namespace StudyHub.Api.Models;

public class Deck
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public User? User { get; set; }

    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(400)]
    public string? Description { get; set; }

    [MaxLength(20)]
    public string Color { get; set; } = "#7c5cff";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Flashcard> Cards { get; set; } = new List<Flashcard>();
}

/// <summary>A flashcard with SM-2 spaced repetition scheduling fields.</summary>
public class Flashcard
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid DeckId { get; set; }
    public Deck? Deck { get; set; }

    [Required, MaxLength(2000)]
    public string Front { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Back { get; set; } = string.Empty;

    // --- SM-2 algorithm state ---
    /// <summary>Ease factor, starts at 2.5.</summary>
    public double EaseFactor { get; set; } = 2.5;
    /// <summary>Current interval in days.</summary>
    public int IntervalDays { get; set; } = 0;
    /// <summary>Number of consecutive correct reviews.</summary>
    public int Repetitions { get; set; } = 0;
    /// <summary>When this card is next due for review.</summary>
    public DateTime DueAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastReviewedAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
