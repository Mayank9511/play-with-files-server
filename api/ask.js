require("dotenv").config();
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const formidable = require("formidable-serverless");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

console.log("inside ask.js");
module.exports = async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins (or specify the frontend domain)
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form:", err);
      return res.status(500).json({ message: "Form parsing failed." });
    }

    const { question } = fields;
    const file = files.file;

    if (!file || !question) {
      return res
        .status(400)
        .json({ message: "File and question are required." });
    }

    try {
      // Upload the file to GoogleAIFileManager
      const uploadResponse = await fileManager.uploadFile(file.path, {
        mimeType: file.type,
        displayName: file.name,
      });

      // Generate AI response using the uploaded file
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([
        {
          fileData: {
            mimeType: uploadResponse.file.mimeType,
            fileUri: uploadResponse.file.uri,
          },
        },
        { text: question },
      ]);

      res.json({ answer: result.response.text() });
    } catch (error) {
        console.error("Error details:", error.message || error);
        if (error.message === "Unsupported file type.") {
          res.send({answer: error.message});
        } else {
          res.send({answer: "An error occurred or file type is not supported"});
        }
      }
  });
};
