using System.ComponentModel.DataAnnotations;

namespace StudyHub.Api.Models;

public enum TaskStatus
{
    Todo = 0,
    Doing = 1,
    Done = 2
}

public class TaskItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }
    public User? User { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }

    public TaskStatus Status { get; set; } = TaskStatus.Todo;

    /// <summary>Ordering within a Kanban column.</summary>
    public int Position { get; set; }

    public DateOnly? DueDate { get; set; }

    [MaxLength(60)]
    public string? Subject { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
