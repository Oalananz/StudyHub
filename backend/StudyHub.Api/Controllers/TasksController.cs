using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.Api.Data;
using StudyHub.Api.DTOs;
using StudyHub.Api.Models;
using StudyHub.Api.Services;

namespace StudyHub.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;
    public TasksController(AppDbContext db) => _db = db;

    private static TaskDto Map(TaskItem t) =>
        new(t.Id, t.Title, t.Description, t.Subject, t.DueDate, t.Status, t.Position);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskDto>>> List()
    {
        var uid = User.GetUserId();
        var items = await _db.Tasks
            .Where(t => t.UserId == uid)
            .OrderBy(t => t.Status).ThenBy(t => t.Position)
            .Select(t => Map(t))
            .ToListAsync();
        return items;
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create(CreateTaskDto dto)
    {
        var uid = User.GetUserId();
        var maxPos = await _db.Tasks
            .Where(t => t.UserId == uid && t.Status == Models.TaskStatus.Todo)
            .Select(t => (int?)t.Position).MaxAsync() ?? -1;

        var task = new TaskItem
        {
            UserId = uid,
            Title = dto.Title.Trim(),
            Description = dto.Description,
            Subject = dto.Subject,
            DueDate = dto.DueDate,
            Position = maxPos + 1
        };
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();
        return Map(task);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskDto>> Update(Guid id, UpdateTaskDto dto)
    {
        var uid = User.GetUserId();
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == uid);
        if (task is null) return NotFound();

        if (dto.Title is not null) task.Title = dto.Title.Trim();
        if (dto.Description is not null) task.Description = dto.Description;
        if (dto.Subject is not null) task.Subject = dto.Subject;
        if (dto.DueDate is not null) task.DueDate = dto.DueDate;
        if (dto.Status is not null) task.Status = dto.Status.Value;
        if (dto.Position is not null) task.Position = dto.Position.Value;
        task.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Map(task);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var uid = User.GetUserId();
        var task = await _db.Tasks.FirstOrDefaultAsync(t => t.Id == id && t.UserId == uid);
        if (task is null) return NotFound();
        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
