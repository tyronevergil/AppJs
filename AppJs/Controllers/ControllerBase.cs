using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

namespace AppJs.Controllers
{
    public abstract class ControllerBase : Controller
    {
        protected bool IsAjaxRequest()
        {
            return Request.Headers["X-Requested-With"] == "XMLHttpRequest";
        }

        protected bool IsJsonRequest()
        {
            return IsAjaxRequest() &&
                   Request.Headers["Accept"].ToString().Contains("/json", StringComparison.OrdinalIgnoreCase);
        }
    }
}