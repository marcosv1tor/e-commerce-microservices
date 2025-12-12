using System;
using System.Collections.Generic;
using System.Text;

namespace Identity.Application.DTOs
{
    public record LoginResponse(Guid Userid, string Name, string Email, string Token, string RefreshToken);
}
 