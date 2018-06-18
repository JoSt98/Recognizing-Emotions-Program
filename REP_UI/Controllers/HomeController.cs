using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using REP_UI.Models;

namespace REP_UI.Controllers
{
    public class HomeController : Controller
    {

        public IActionResult About()
        {
            //ViewData["Title"] = "REP - Recognizing Emotions Program";
            ViewData["Message"] = "Was macht diese Webseite...";

            return View();
        }

        public IActionResult Main()
        {
            return View();
        }


        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
