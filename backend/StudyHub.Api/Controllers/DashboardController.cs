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
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;
    public DashboardController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get()
    {
        var uid = User.GetUserId();
        var user = await _db.Users.FindAsync(uid);
        if (user is null) return Unauthorized();

        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);
        var since = now.AddDays(-90);

        var sessions = await _db.Sessions
            .Where(s => s.UserId == uid)
            .Select(s => new { s.Subject, s.DurationMinutes, s.StartedAt })
            .ToListAsync();

        var totalMinutes = sessions.Sum(s => s.DurationMinutes);
        var todayMinutes = sessions.Where(s => DateOnly.FromDateTime(s.StartedAt) == today).Sum(s => s.DurationMinutes);

        var timeBySubject = sessions
            .GroupBy(s => s.Subject)
            .Select(g => new SubjectTimeDto(g.Key, g.Sum(x => x.DurationMinutes)))
            .OrderByDescending(x => x.Minutes)
            .Take(8)
            .ToList();

        var heatmap = sessions
            .Where(s => s.StartedAt >= since)
            .GroupBy(s => DateOnly.FromDateTime(s.StartedAt))
            .Select(g => new HeatmapDayDto(g.Key, g.Sum(x => x.DurationMinutes)))
            .OrderBy(x => x.Date)
            .ToList();

        var dueCards = await _db.Flashcards.CountAsync(c => c.Deck!.UserId == uid && c.DueAt <= now);
        var openTasks = await _db.Tasks.CountAsync(t => t.UserId == uid && t.Status != Models.TaskStatus.Done);

        return new DashboardDto(
            UserDto.From(user),
            totalMinutes,
            todayMinutes,
            sessions.Count,
            dueCards,
            openTasks,
            timeBySubject,
            heatmap);
    }

    [HttpGet("achievements")]
    public async Task<ActionResult<IEnumerable<AchievementDto>>> Achievements()
    {
        var uid = User.GetUserId();
        var catalog = await _db.Achievements.ToListAsync();
        var owned = await _db.UserAchievements
            .Where(ua => ua.UserId == uid)
            .ToDictionaryAsync(ua => ua.AchievementCode, ua => ua.UnlockedAt);

        return catalog
            .Select(a => new AchievementDto(
                a.Code, a.Title, a.Description, a.Icon, a.XpReward,
                owned.ContainsKey(a.Code),
                owned.TryGetValue(a.Code, out var t) ? t : null))
            .OrderByDescending(a => a.Unlocked)
            .ToList();
    }
}
