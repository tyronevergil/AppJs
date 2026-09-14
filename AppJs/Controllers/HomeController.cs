using Microsoft.AspNetCore.Mvc;

namespace AppJs.Controllers
{
    public class HomeController : ControllerBase
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Demo()
        {
            if (IsAjaxRequest())
                return PartialView("_Demo");
            else
                return View("Demo");
        }

        public IActionResult ContactMe()
        {
            if (IsAjaxRequest())
                return PartialView("_ContactMe");
            else
                return View("ContactMe");
        }
    }
}