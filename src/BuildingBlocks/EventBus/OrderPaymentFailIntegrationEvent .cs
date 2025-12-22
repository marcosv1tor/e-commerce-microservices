using System;
using System.Collections.Generic;
using System.Text;

namespace EventBus
{
    public record OrderPaymentFailedIntegrationEvent(Guid OrderId, string Reason) : IntegrationEvent;
}
