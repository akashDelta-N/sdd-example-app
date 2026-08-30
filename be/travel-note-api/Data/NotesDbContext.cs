using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using travel_note_api.Models;

namespace travel_note_api.Data;

public class NotesDbContext(DbContextOptions<NotesDbContext> options) : DbContext(options)
{
    public DbSet<Note> Notes => Set<Note>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // SQLite loses DateTimeKind on read; force UTC back on so the API serialises with a 'Z'.
        var utc = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

        var note = modelBuilder.Entity<Note>();
        note.HasKey(n => n.Id);
        note.Property(n => n.Title).IsRequired().HasMaxLength(200);
        note.Property(n => n.Body).IsRequired();
        note.Property(n => n.Latitude).IsRequired();
        note.Property(n => n.Longitude).IsRequired();
        note.Property(n => n.IsArchived).HasDefaultValue(false);
        note.HasOne(n => n.Parent).WithMany(n => n.Children).HasForeignKey(n => n.ParentId).OnDelete(DeleteBehavior.Restrict);
        note.ToTable(table =>
        {
            table.HasCheckConstraint("CK_Notes_Latitude", "Latitude >= -90 AND Latitude <= 90");
            table.HasCheckConstraint("CK_Notes_Longitude", "Longitude >= -180 AND Longitude <= 180");
        });
        note.Property(n => n.CreatedAt).HasConversion(utc);
        note.Property(n => n.UpdatedAt).HasConversion(utc);
        note.HasIndex(n => n.UpdatedAt);
        note.HasIndex(n => n.ParentId);
    }
}
