using Microsoft.EntityFrameworkCore;
using StudyHub.Api.Models;

namespace StudyHub.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<StudySession> Sessions => Set<StudySession>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Deck> Decks => Set<Deck>();
    public DbSet<Flashcard> Flashcards => Set<Flashcard>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<Achievement> Achievements => Set<Achievement>();
    public DbSet<UserAchievement> UserAchievements => Set<UserAchievement>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<User>().HasIndex(u => u.Email).IsUnique();

        b.Entity<StudySession>()
            .HasOne(s => s.User).WithMany(u => u.Sessions)
            .HasForeignKey(s => s.UserId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<TaskItem>()
            .HasOne(t => t.User).WithMany(u => u.Tasks)
            .HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<Deck>()
            .HasOne(d => d.User).WithMany(u => u.Decks)
            .HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<Flashcard>()
            .HasOne(c => c.Deck).WithMany(d => d.Cards)
            .HasForeignKey(c => c.DeckId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<Note>()
            .HasOne(n => n.User).WithMany(u => u.Notes)
            .HasForeignKey(n => n.UserId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<Note>()
            .HasOne(n => n.Parent).WithMany(n => n.Children)
            .HasForeignKey(n => n.ParentId).OnDelete(DeleteBehavior.Restrict);

        b.Entity<UserAchievement>()
            .HasOne(ua => ua.User).WithMany(u => u.Achievements)
            .HasForeignKey(ua => ua.UserId).OnDelete(DeleteBehavior.Cascade);

        b.Entity<UserAchievement>()
            .HasOne(ua => ua.Achievement).WithMany()
            .HasForeignKey(ua => ua.AchievementCode).OnDelete(DeleteBehavior.Cascade);

        b.Entity<UserAchievement>()
            .HasIndex(ua => new { ua.UserId, ua.AchievementCode }).IsUnique();

        // Seed the achievement catalog.
        b.Entity<Achievement>().HasData(
            new Achievement { Code = "first_session", Title = "First Steps", Description = "Complete your first study session.", Icon = "🌱", XpReward = 50 },
            new Achievement { Code = "streak_3", Title = "On a Roll", Description = "Reach a 3-day study streak.", Icon = "🔥", XpReward = 100 },
            new Achievement { Code = "streak_7", Title = "Week Warrior", Description = "Reach a 7-day study streak.", Icon = "⚡", XpReward = 250 },
            new Achievement { Code = "deep_work_10h", Title = "Deep Worker", Description = "Log 10 hours of focused study.", Icon = "🧠", XpReward = 300 },
            new Achievement { Code = "cards_50", Title = "Memory Master", Description = "Review 50 flashcards.", Icon = "🃏", XpReward = 200 },
            new Achievement { Code = "task_master", Title = "Task Slayer", Description = "Complete 25 tasks.", Icon = "✅", XpReward = 200 },
            new Achievement { Code = "night_owl", Title = "Night Owl", Description = "Study after midnight.", Icon = "🦉", XpReward = 75 },
            new Achievement { Code = "early_bird", Title = "Early Bird", Description = "Study before 7 AM.", Icon = "🐦", XpReward = 75 }
        );
    }
}
