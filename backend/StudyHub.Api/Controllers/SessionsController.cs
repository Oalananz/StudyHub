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
public class SessionsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly GamificationService _gamification;

    public SessionsController(AppDbContext db, GamificationService gamification)
    {
        _db = db;
        _gamification = gamification;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SessionDto>>> List([FromQuery] int take = 50)
    {
        var uid = User.GetUserId();
        var items = await _db.Sessions
            .Where(s => s.UserId == uid)
            .OrderByDescending(s => s.StartedAt)
            .Take(Math.Clamp(take, 1, 500))
            .Select(s => new SessionDto(s.Id, s.Subject, s.DurationMinutes, s.Notes, s.StartedAt, s.EndedAt))
            .ToListAsync();
        return items;
    }

    [HttpPost]
    public async Task<ActionResult<object>> Create(CreateSessionDto dto)
    {
        var user = await _db.Users.FindAsync(User.GetUserId());
        if (user is null) return Unauthorized();

        var ended = dto.EndedAt ?? DateTime.UtcNow;
        var session = new StudySession
        {
            UserId = user.Id,
            Subject = string.IsNullOrWhiteSpace(dto.Subject) ? "General" : dto.Subject.Trim(),
            DurationMinutes = dto.DurationMinutes,
            Notes = dto.Notes,
            StartedAt = dto.StartedAt ?? ended.AddMinutes(-dto.DurationMinutes),
            EndedAt = ended
        };

        _db.Sessions.Add(session);
        // Persist the session first so achievement counts (sessions, minutes) include it.
        await _db.SaveChangesAsync();

        // Small XP reward per focused minute.
        user.Xp += dto.DurationMinutes;
        var unlocked = await _gamification.OnStudyActivityAsync(user, ended);

        await _db.SaveChangesAsync();

        return new
        {
            session = new SessionDto(session.Id, session.Subject, session.DurationMinutes, session.Notes, session.StartedAt, session.EndedAt),
            unlocked = unlocked.Select(a => new { a.Code, a.Title, a.Icon, a.XpReward }),
            user = UserDto.From(user)
        };
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var uid = User.GetUserId();
        var session = await _db.Sessions.FirstOrDefaultAsync(s => s.Id == id && s.UserId == uid);
        if (session is null) return NotFound();
        _db.Sessions.Remove(session);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
