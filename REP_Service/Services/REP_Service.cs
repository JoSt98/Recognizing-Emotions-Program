using Microsoft.ProjectOxford.Common.Contract;
using Microsoft.ProjectOxford.Face;
using Microsoft.ProjectOxford.Face.Contract;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebApplication2.Services
{
    public class REP_Service
    {
        #region "global (Parameter & Properties)"
        // Face-API
        private readonly IFaceServiceClient faceServiceClient = new FaceServiceClient("12d60271d81e416295934198e9668054", "https://westeurope.api.cognitive.microsoft.com/face/v1.0");

        // Abfrageliste an Face-API 
        private IEnumerable<FaceAttributeType> faceAttributes = new FaceAttributeType[] {FaceAttributeType.Emotion};

        // Übersetzungsliste der Emotionsbezeichnungen
        private Dictionary<string, string> _translate;
        public Dictionary<string, string> translate
        {
            get
            {
                if (_translate == null) _translate = new Dictionary<string, string> { { "Anger", "Wut" }, { "Contempt", "Verachtung" }, { "Disgust", "Ekel" }, { "Fear", "Angst" }, { "Happiness", "Freude" }, { "Neutral", "Neutral" }, { "Sadness", "Traurigkeit" }, { "Surprise", "Überraschung" } };
                return _translate;
            }
        }

        #endregion

        #region "Init"
        public REP_Service()
        {

        }
        #endregion

        #region "Hauptfunktionen"
        public async Task<string> Face_Analyse(Stream imageFileStream)
        {
            //Count Faces
            Face[] faces = await faceServiceClient.DetectAsync(imageFileStream, returnFaceId: true, returnFaceLandmarks: false, returnFaceAttributes: faceAttributes);

            if (faces.Count() > 1) throw new Exception("Zu viele Gesichter erkannt...");
            if (faces.Count() < 1) throw new Exception("Kein Gesicht erkannt...");

            //Emotion für Gesicht auslesen
            EmotionScores emotionScores = faces[0].FaceAttributes.Emotion;
            Dictionary<string, float> emotionList = new Dictionary<string, float>(emotionScores.ToRankedList());

            //Zusammensetzen der Rückgabe
            StringBuilder sb = new StringBuilder();
            sb.Append("<div><table>");
            foreach (KeyValuePair<string,float> element in emotionList)
            {
                sb.Append(String.Format("<tr><td>{0}: " + "</td><td>" + " {1}%" + "</td></tr>", Translate(element.Key), (element.Value * 100).ToString()));
            }
            sb.Append("</table></div>");

            //Rückgabe
            return Newtonsoft.Json.JsonConvert.SerializeObject(sb.ToString());

        }
        #endregion

        #region "Hilfsfunktionen"
        //Übersetzen der Emotionsnamen
        string Translate(string Name)
        {
            string retName;
            if (!translate.TryGetValue(Name, out retName)) retName = Name;
            return retName;
        }
        #endregion
    }
}
