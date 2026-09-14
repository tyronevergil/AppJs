using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace AppJs.Services
{
    public class CommHub : Hub
    {
        public async Task PublishMessage(string id, string type, string payload)
        {
            await Clients.All.SendAsync("subscribeMessage", id, type, payload);
        }
    }
}