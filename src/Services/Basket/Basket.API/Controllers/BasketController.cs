using Basket.Application.Commands.DeleteBasket;
using Basket.Application.Commands.UpdateBasket;
using Basket.Application.Queries.GetBasket;
using Basket.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Basket.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class BasketController : ControllerBase
{
    private readonly IMediator _mediator;

    public BasketController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("{userName}")]
    [ProducesResponseType(typeof(ShoppingCart), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBasket(string userName)
    {
        var query = new GetBasketQuery(userName);
        var result = await _mediator.Send(query);
        return Ok(result.Value);
    }

    [HttpPost]
    [ProducesResponseType(typeof(ShoppingCart), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateBasket([FromBody] ShoppingCart basket)
    {
        var command = new UpdateBasketCommand(basket);
        var result = await _mediator.Send(command);
        return Ok(result.Value);
    }

    [HttpDelete("{userName}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteBasket(string userName)
    {
        var command = new DeleteBasketCommand(userName);
        await _mediator.Send(command);
        return NoContent();
    }
}