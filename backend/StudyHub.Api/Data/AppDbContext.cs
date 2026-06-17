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

        // Seed the achievement catalog (fresh databases). Existing databases are topped up
        // at startup — see SeedAchievementsAsync in Program.cs.
        b.Entity<Achievement>().HasData(AchievementCatalog.All);
    }
}
