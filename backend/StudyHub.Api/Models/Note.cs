using System.ComponentModel.DataAnnotations;

namespace StudyHub.Api.Models;

/// <summary>A note in a hierarchical (self-referencing) tree.</summary>
public class Note
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public User? User { get; set; }

    /// <summary>Parent note for nesting; null = top level.</summary>
    public Guid? ParentId { get; set; }
    public Note? Parent { get; set; }
    public ICollection<Note> Children { get; set; } = new List<Note>();

    [Required, MaxLength(200)]
    public string Title { get; set; } = "Untitled";

    public string Content { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Icon { get; set; } = "📝";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
