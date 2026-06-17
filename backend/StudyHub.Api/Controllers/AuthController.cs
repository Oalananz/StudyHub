using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyHub.Api.Data;
using StudyHub.Api.DTOs;
using StudyHub.Api.Models;
using StudyHub.Api.Services;

namespace StudyHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly TokenService _tokens;

    public AuthController(AppDbContext db, TokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await _db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { message = "An account with that email already exists." });

        var user = new User
        {
            DisplayName = dto.DisplayName.Trim(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponse(_tokens.CreateToken(user), UserDto.From(user));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        return new AuthResponse(_tokens.CreateToken(user), UserDto.From(user));
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> Me()
    {
        var user = await _db.Users.FindAsync(User.GetUserId());
        return user is null ? NotFound() : UserDto.From(user);
    }

    [Authorize]
    [HttpPut("preferences")]
    public async Task<ActionResult<UserDto>> UpdatePrefs(UpdatePrefsDto dto)
    {
        var user = await _db.Users.FindAsync(User.GetUserId());
        if (user is null) return NotFound();

        user.PomodoroWorkMinutes = Math.Clamp(dto.PomodoroWorkMinutes, 1, 120);
        user.PomodoroShortBreakMinutes = Math.Clamp(dto.PomodoroShortBreakMinutes, 1, 60);
        user.PomodoroLongBreakMinutes = Math.Clamp(dto.PomodoroLongBreakMinutes, 1, 60);
        user.PomodoroRoundsBeforeLongBreak = Math.Clamp(dto.PomodoroRoundsBeforeLongBreak, 1, 12);

        await _db.SaveChangesAsync();
        return UserDto.From(user);
    }
}
