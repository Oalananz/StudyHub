using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace StudyHub.Api.Services;

public static class ClaimsExtensions
{
    /// <summary>Reads the authenticated user's id from the JWT 'sub' claim.</summary>
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var sub = principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.Parse(sub!);
    }
}
