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
public class NotesController : ControllerBase
{
    private readonly AppDbContext _db;
    public NotesController(AppDbContext db) => _db = db;

    private static NoteDto Map(Note n) => new(n.Id, n.ParentId, n.Title, n.Content, n.Icon, n.UpdatedAt);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<NoteDto>>> List()
    {
        var uid = User.GetUserId();
        var notes = await _db.Notes
            .Where(n => n.UserId == uid)
            .OrderBy(n => n.Title)
            .Select(n => Map(n))
            .ToListAsync();
        return notes;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NoteDto>> Get(Guid id)
    {
        var uid = User.GetUserId();
        var note = await _db.Notes.FirstOrDefaultAsync(n => n.Id == id && n.UserId == uid);
        return note is null ? NotFound() : Map(note);
    }

    [HttpPost]
    public async Task<ActionResult<NoteDto>> Create(CreateNoteDto dto)
    {
        var uid = User.GetUserId();
        var note = new Note
        {
            UserId = uid,
            Title = string.IsNullOrWhiteSpace(dto.Title) ? "Untitled" : dto.Title.Trim(),
            ParentId = dto.ParentId,
            Icon = string.IsNullOrWhiteSpace(dto.Icon) ? "📝" : dto.Icon
        };
        _db.Notes.Add(note);
        await _db.SaveChangesAsync();
        return Map(note);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<NoteDto>> Update(Guid id, UpdateNoteDto dto)
    {
        var uid = User.GetUserId();
        var note = await _db.Notes.FirstOrDefaultAsync(n => n.Id == id && n.UserId == uid);
        if (note is null) return NotFound();

        if (dto.Title is not null) note.Title = dto.Title.Trim();
        if (dto.Content is not null) note.Content = dto.Content;
        if (dto.Icon is not null) note.Icon = dto.Icon;
        if (dto.ParentId is not null) note.ParentId = dto.ParentId == Guid.Empty ? null : dto.ParentId;
        note.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Map(note);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var uid = User.GetUserId();
        var note = await _db.Notes.FirstOrDefaultAsync(n => n.Id == id && n.UserId == uid);
        if (note is null) return NotFound();

        // Re-parent children to this note's parent so the tree stays valid.
        var children = await _db.Notes.Where(n => n.ParentId == id).ToListAsync();
        foreach (var c in children) c.ParentId = note.ParentId;

        _db.Notes.Remove(note);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
