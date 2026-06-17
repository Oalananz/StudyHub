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
public class DecksController : ControllerBase
{
    private readonly AppDbContext _db;
    public DecksController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DeckDto>>> List()
    {
        var uid = User.GetUserId();
        var now = DateTime.UtcNow;
        var decks = await _db.Decks
            .Where(d => d.UserId == uid)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new DeckDto(
                d.Id, d.Name, d.Description, d.Color,
                d.Cards.Count,
                d.Cards.Count(c => c.DueAt <= now)))
            .ToListAsync();
        return decks;
    }

    [HttpPost]
    public async Task<ActionResult<DeckDto>> Create(CreateDeckDto dto)
    {
        var uid = User.GetUserId();
        var deck = new Deck
        {
            UserId = uid,
            Name = dto.Name.Trim(),
            Description = dto.Description,
            Color = string.IsNullOrWhiteSpace(dto.Color) ? "#7c5cff" : dto.Color
        };
        _db.Decks.Add(deck);
        await _db.SaveChangesAsync();
        return new DeckDto(deck.Id, deck.Name, deck.Description, deck.Color, 0, 0);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var uid = User.GetUserId();
        var deck = await _db.Decks.FirstOrDefaultAsync(d => d.Id == id && d.UserId == uid);
        if (deck is null) return NotFound();
        _db.Decks.Remove(deck);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // ----- Cards -----

    [HttpGet("{deckId:guid}/cards")]
    public async Task<ActionResult<IEnumerable<CardDto>>> Cards(Guid deckId)
    {
        var uid = User.GetUserId();
        if (!await _db.Decks.AnyAsync(d => d.Id == deckId && d.UserId == uid)) return NotFound();

        var cards = await _db.Flashcards
            .Where(c => c.DeckId == deckId)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new CardDto(c.Id, c.Front, c.Back, c.DueAt, c.Repetitions, c.EaseFactor, c.IntervalDays))
            .ToListAsync();
        return cards;
    }

    /// <summary>Cards currently due for review (the study queue).</summary>
    [HttpGet("{deckId:guid}/due")]
    public async Task<ActionResult<IEnumerable<CardDto>>> Due(Guid deckId)
    {
        var uid = User.GetUserId();
        if (!await _db.Decks.AnyAsync(d => d.Id == deckId && d.UserId == uid)) return NotFound();

        var now = DateTime.UtcNow;
        var cards = await _db.Flashcards
            .Where(c => c.DeckId == deckId && c.DueAt <= now)
            .OrderBy(c => c.DueAt)
            .Select(c => new CardDto(c.Id, c.Front, c.Back, c.DueAt, c.Repetitions, c.EaseFactor, c.IntervalDays))
            .ToListAsync();
        return cards;
    }

    [HttpPost("{deckId:guid}/cards")]
    public async Task<ActionResult<CardDto>> AddCard(Guid deckId, CreateCardDto dto)
    {
        var uid = User.GetUserId();
        if (!await _db.Decks.AnyAsync(d => d.Id == deckId && d.UserId == uid)) return NotFound();

        var card = new Flashcard
        {
            DeckId = deckId,
            Front = dto.Front.Trim(),
            Back = dto.Back.Trim(),
            DueAt = DateTime.UtcNow
        };
        _db.Flashcards.Add(card);
        await _db.SaveChangesAsync();
        return new CardDto(card.Id, card.Front, card.Back, card.DueAt, card.Repetitions, card.EaseFactor, card.IntervalDays);
    }

    [HttpDelete("cards/{cardId:guid}")]
    public async Task<IActionResult> DeleteCard(Guid cardId)
    {
        var uid = User.GetUserId();
        var card = await _db.Flashcards.FirstOrDefaultAsync(c => c.Id == cardId && c.Deck!.UserId == uid);
        if (card is null) return NotFound();
        _db.Flashcards.Remove(card);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Grade a card review using the SM-2 spaced repetition algorithm.</summary>
    [HttpPost("cards/{cardId:guid}/review")]
    public async Task<ActionResult<CardDto>> Review(Guid cardId, ReviewCardDto dto)
    {
        var uid = User.GetUserId();
        var card = await _db.Flashcards.FirstOrDefaultAsync(c => c.Id == cardId && c.Deck!.UserId == uid);
        if (card is null) return NotFound();

        ApplySm2(card, dto.Quality);
        card.LastReviewedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return new CardDto(card.Id, card.Front, card.Back, card.DueAt, card.Repetitions, card.EaseFactor, card.IntervalDays);
    }

    /// <summary>SM-2 (SuperMemo 2) scheduling. Quality 0-5; &lt;3 resets the card.</summary>
    private static void ApplySm2(Flashcard card, int quality)
    {
        if (quality < 3)
        {
            card.Repetitions = 0;
            card.IntervalDays = 1;
        }
        else
        {
            card.Repetitions += 1;
            card.IntervalDays = card.Repetitions switch
            {
                1 => 1,
                2 => 6,
                _ => (int)Math.Round(card.IntervalDays * card.EaseFactor)
            };
        }

        // Update ease factor, floored at 1.3.
        card.EaseFactor += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
        if (card.EaseFactor < 1.3) card.EaseFactor = 1.3;

        card.DueAt = DateTime.UtcNow.AddDays(Math.Max(1, card.IntervalDays));
    }
}
