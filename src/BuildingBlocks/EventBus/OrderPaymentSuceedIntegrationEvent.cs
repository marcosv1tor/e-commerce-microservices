using System;
using System.Collections.Generic;
using System.Text;

namespace EventBus
{
    public record OrderPaymentSucceededIntegrationEvent(Guid OrderId) : IntegrationEvent;
}
