using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Order.Application.Commands.CheckoutOrder;
using Order.Application.DTOs;
using Order.Application.Queries;
using Order.Application.Queries.GetOrderById;
using Order.Application.Queries.GetOrders;
using Order.Application.ViewModels;
using Order.Domain.ValueObjects;
using System.Security.Claims; // Necessário para ler o Token

namespace Order.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize] // 🔒 Todo o controller é protegido
public class OrderController : ControllerBase
{
    private readonly IMediator _mediator;

    public OrderController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("checkout")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequest request)
    {
        // 1. Extrair dados do Token (Claims)
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
                     User.FindFirst("sub")?.Value;

        var userName = User.Identity?.Name ??
                       User.FindFirst("name")?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        // 2. Montar o Comando Seguro
        var command = new CheckoutOrderCommand(
            userId,
            userName!,
            request.Address,
            request.Items
        );

        // 3. Enviar
        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(new { OrderId = result.Value });
    }
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<OrderViewModel>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyOrders()
    {
        // Pega o userName do Token
        var userName = User.Identity?.Name ?? User.FindFirst("name")?.Value;

        if (string.IsNullOrEmpty(userName))
            return Unauthorized();

        var query = new GetOrdersByUserNameQuery(userName);
        var result = await _mediator.Send(query);

        return Ok(result.Value);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(OrderDetailViewModel), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetOrderById(string id)
    {
        var query = new GetOrderByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return NotFound(new { error = result.Error });

        // Validação extra de segurança: O dono do pedido é quem está logado?
        // (Opcional por agora, mas recomendada)
        // var userName = User.Identity?.Name;
        // if (result.Value.UserName != userName) return Forbid();

        return Ok(result.Value);
    }

    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status304NotModified)]
    public async Task<bool> DeleteOrderAsync(string id)
    { 
        var query = new DeleteOrderByIdAsyncQuery(id);
        var result = await _mediator.Send(query);

        if (result.IsFailure)
            return false;

        return true;
    }

}

// Classe auxiliar para receber o JSON do body (sem o ID do usuário)
public record CheckoutRequest(Address Address, List<OrderItemDto> Items);