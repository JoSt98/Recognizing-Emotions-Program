using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;

namespace WebApplication2.Controllers
{
    [Produces("application/json")]
    [Route("api/[controller]")]
    public class REPController : Controller
    {
        #region "globale Parameter/Properties"
        private readonly Services.REP_Service RepService = new Services.REP_Service();

        #endregion

        #region "Controllerzugänge"
        [HttpGet]
        public string Get()
        {
            return "Controller :" + this.ToString(); //ToDo: Version herausfinden (ProjectPropertiesAssemblyInfo)
        }


        [HttpPost("REP_Analyze")]
        public async Task<IActionResult> GetEmotionAsync()
        {
            try
            {
                //POST-Parameter auf Body auslesen
                string postParam = "";
                using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
                {
                    postParam = await reader.ReadToEndAsync();
                }

                //POST-Parameter in ByteArray umwandeln
                string strData = postParam.Substring("data:image/png;base64,".Length);
                byte[] data = Convert.FromBase64String(strData);

                //Test
                //System.IO.File.WriteAllBytes(@"c:/meineProgramme/Test.jpg", data);

                //Stream erstellen und an Face-API senden
                Stream stream = new MemoryStream(data);
                string content = await RepService.Face_Analyse(stream);

                //Rückgabe
                return Ok(content);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

        }

        #endregion
    }
}

